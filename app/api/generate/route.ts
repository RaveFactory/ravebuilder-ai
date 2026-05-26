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
You are RaveBuilder AI.

You MUST return ONLY valid JSON.

Return this exact structure:

{
  "pages": [
    {
      "name": "Home",
      "html": "<html><body>Example</body></html>"
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
      }),
    });

    const data = await response.json();

    const raw = data.choices[0].message.content;

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return Response.json(parsed);
  } catch (error) {
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
