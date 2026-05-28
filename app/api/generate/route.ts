export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-small",
          messages: [
            {
              role: "system",
              content:
                "Return ONLY valid JSON with pages and seo.",
            },
            {
              role: "user",
              content: `
Generate a rave festival website.

Return this exact JSON format:

{
  "pages": {
    "home": "<html><body><h1>HOME</h1></body></html>",
    "event": "<html><body><h1>EVENT</h1></body></html>",
    "tickets": "<html><body><h1>TICKETS</h1></body></html>",
    "gallery": "<html><body><h1>GALLERY</h1></body></html>",
    "faq": "<html><body><h1>FAQ</h1></body></html>",
    "blog": "<html><body><h1>BLOG</h1></body></html>",
    "contact": "<html><body><h1>CONTACT</h1></body></html>"
  },
  "seo": {
    "title": "Rave Festival",
    "description": "Best rave festival website",
    "keywords": "rave, hardtek, techno"
  }
}
`,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const raw = await response.json();

    console.log("RAW RESPONSE:", JSON.stringify(raw));

    const content =
      raw?.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        {
          error: "No content returned",
          raw,
        },
        {
          status: 500,
        }
      );
    }

    const data = JSON.parse(content);

    return Response.json(data);
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
