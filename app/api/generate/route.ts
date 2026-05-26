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
          messages: [
            {
              role: "system",
              content: `
You are RaveBuilder AI.

You MUST return ONLY valid JSON.

Do not explain anything.
Do not add markdown.
Do not add text before or after JSON.

Return this exact structure:

{
  "pages": [
    {
      "name": "Home",
      "html": "<html><body><h1>Example</h1></body></html>"
    },
    {
      "name": "Gallery",
      "html": "<html><body><img src='https://picsum.photos/800/600' /></body></html>"
    }
  ]
}
              `,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return Response.json(
        {
          error: "Empty response from Mistral",
        },
        {
          status: 500,
        }
      );
    }

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error(cleaned);

      return Response.json(
        {
          error: "Invalid JSON returned by Mistral",
          raw: cleaned,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(parsed);
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
