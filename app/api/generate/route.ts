export async function POST(req: Request) {
  try {
    const { prompt, template } = await req.json();
    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${process.env.MISTRAL_API_KEY}`,
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
Do not use markdown.
Do not use backticks.
Do not explain anything.
Generate a complete multi-page rave website.
The HTML must include:
- full HTML structure
- inline CSS
- responsive design
- dark rave aesthetic
- modern layout
Return EXACTLY this format:
{
  "pages": {
    "home": "<html>...</html>",
    "event": "<html>...</html>",
    "tickets": "<html>...</html>",
    "gallery": "<html>...</html>",
    "faq": "<html>...</html>",
    "blog": "<html>...</html>",
    "contact": "<html>...</html>"
  },
  "seo": {
    "title": "Website title",
    "description": "Website description",
    "keywords": "music, rave, techno"
  }
}
`,
            },
            {
              role: "user",
              content:
                `Template: ${template}\n\n${prompt}`,
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
          error:
            "Empty response from Mistral",
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
      console.error(
        "JSON PARSE ERROR:",
        err
      );
      return Response.json(
        {
          error:
            "Invalid JSON from Mistral",
          raw: content,
        },
        {
          status: 500,
        }
      );
    }
    if (
      !data.pages ||
      typeof data.pages !== "object"
    ) {
      return Response.json(
        {
          error:
            "Missing pages object",
          raw: data,
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
