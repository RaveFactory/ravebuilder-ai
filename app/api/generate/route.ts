import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const mistralResponse = await fetch(
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
You are a website generator.

You MUST return ONLY valid JSON.

Return EXACTLY this structure:

{
  "pages": [
    {
      "name": "Home",
      "html": "<html><body><h1>Hello</h1></body></html>"
    }
  ]
}

No markdown.
No explanations.
No backticks.
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

    const raw = await mistralResponse.json();

    console.log("RAW MISTRAL:", raw);

    const content =
      raw?.choices?.[0]?.message?.content || "";

    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("CLEANED:", cleaned);

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}
