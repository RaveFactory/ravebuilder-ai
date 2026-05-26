import { NextResponse } from "next/server";

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

Do not explain.
Do not add markdown.
Do not add text before or after JSON.

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
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
