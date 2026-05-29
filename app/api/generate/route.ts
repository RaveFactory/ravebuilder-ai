export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "system",
              content: `
You are RaveBuilder AI.

Return ONLY valid JSON.

IMPORTANT:
- No markdown
- No explanations
- No code blocks
- Return exactly one JSON object
- All HTML must be on a single line
- Do not include line breaks inside HTML strings

Return this structure:

{
  "pages": {
    "home": "<html><body><h1>Home</h1></body></html>",
    "event": "<html><body><h1>Event</h1></body></html>",
    "tickets": "<html><body><h1>Tickets</h1></body></html>",
    "gallery": "<html><body><h1>Gallery</h1></body></html>",
    "faq": "<html><body><h1>FAQ</h1></body></html>",
    "blog": "<html><body><h1>Blog</h1></body></html>",
    "contact": "<html><body><h1>Contact</h1></body></html>"
  },
  "seo": {
    "title": "Website title",
    "description": "Website description",
    "keywords": "rave, techno, hardtek"
  }
}
`,
            },
            {
              role: "user",
              content: body.prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const raw = await response.json();

    let content =
      raw?.choices?.[0]?.message?.content || "";

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\r/g, "")
      .trim();

    console.log("CLEAN CONTENT:", content);

    try {
      const data = JSON.parse(content);

      return Response.json(data);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      console.error("RAW CONTENT:", content);

      return Response.json(
        {
          error: "Invalid JSON from Mistral",
          raw: content,
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("FULL ERROR:", error);

    return Response.json(
      {
        error: "Generation failed",
      },
      {
        status: 500,
      }
    );
  }
}
