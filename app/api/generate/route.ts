export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    console.log(
      "API KEY EXISTS:",
      !!process.env.MISTRAL_API_KEY
    );

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "open-mistral-7b",
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content: `
You are RaveBuilder AI.

Return ONLY valid JSON.

Format:
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

    console.log("STATUS:", response.status);

    const raw = await response.json();

    console.log("RAW:", raw);

    const content =
      raw?.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        {
          error: "Empty response from Mistral",
        },
        {
          status: 500,
        }
      );
    }

    let data;

    try {
      data = JSON.parse(content);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);

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
