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
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content:
              "Return ONLY raw HTML. No markdown. No JSON. No explanation.",
          },
          {
            role: "user",
            content:
              prompt +
              " Create a cyberpunk rave landing page in pure HTML.",
          },
        ],
      }),
    });

    const raw = await response.json();

    const html =
      raw?.choices?.[0]?.message?.content ||
      "<html><body><h1>Error</h1></body></html>";

    return NextResponse.json({
      pages: [
        {
          name: "Home",
          html,
        },
      ],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Generation failed",
      },
      {
        status: 500,
      }
    );
  }
}
