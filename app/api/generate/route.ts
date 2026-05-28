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
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are RaveBuilder AI.

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

    const content =
      raw?.choices?.[0]?.message?.content || '{"pages": []}';

    const data = JSON.parse(content);

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
