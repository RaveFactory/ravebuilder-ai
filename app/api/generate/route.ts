export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
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
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
You are RaveBuilder AI.
Return ONLY valid JSON.
Format:
{
  "pages": {
    "home": "<html><body><h1>Hello</h1></body></html>"
  },
  "seo": {
    "title": "Website title",
    "description": "Website description",
    "keywords": "music, techno, rave"
  }
}
`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );
    const raw = await response.json();
    console.log("MISTRAL RAW:", raw);
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
    console.error(error);
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
