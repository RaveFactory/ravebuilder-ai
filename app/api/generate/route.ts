export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    console.log(
      "API KEY EXISTS:",
      !!process.env.MISTRAL_API_KEY
    );

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "open-mistral-7b",
          messages: [
            {
              role: "user",
              content:
                "Return ONLY this JSON: {\"pages\":{\"home\":\"<html><body><h1>Hello</h1></body></html>\"}}",
            },
          ],
        }),
      }
    );

    console.log("STATUS:", response.status);

    const rawText = await response.text();

    console.log("RAW RESPONSE:", rawText);

    return Response.json({
      success: true,
      raw: rawText,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

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
