export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
You are a website generator.

Return ONLY valid JSON.

Format:
{
  "pages": [
    {
      "name": "Home",
      "html": "<html><body><h1>Hello</h1></body></html>"
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
        temperature: 0.7,
      }),
    });

    const raw = await response.json();

    console.log("MISTRAL RAW:", raw);

    const content =
      raw?.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "Empty response from Mistral" },
        { status: 500 }
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("JSON PARSE ERROR:", content);

      return Response.json(
        {
          error: "Invalid JSON from Mistral",
          raw: content,
        },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        error: String(err),
      },
      { status: 500 }
    );
  }
}
