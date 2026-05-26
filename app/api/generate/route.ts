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
              content:
                "Return ONLY valid JSON with pages array.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    const data = await response.json();

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
