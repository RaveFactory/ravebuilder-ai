import { NextRequest, NextResponse } from "next/server";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert web developer specializing in cyberpunk and futuristic design. Generate a complete, single-file HTML website based on the user's description.

Requirements:
- Responsive HTML5 with mobile-first design
- Use Tailwind CSS via CDN (include the script tag)
- Modern sections with proper semantic HTML
- Cyberpunk/futuristic design aesthetic with dark backgrounds, neon accents, and glow effects
- Smooth CSS animations and transitions
- Clean, well-structured code
- Include a viewport meta tag for mobile responsiveness
- All CSS should use Tailwind utility classes plus custom styles in a <style> tag for neon effects
- Include at least: hero section, features/content section, and footer
- Use CSS custom properties for the neon color scheme

Output ONLY the raw HTML code. No markdown, no explanations, no code fences. Just the HTML.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, template, apiKey } = await request.json();

    if (!prompt || !apiKey) {
      return NextResponse.json(
        { error: "Prompt and API key are required" },
        { status: 400 }
      );
    }

    const templateContext: Record<string, string> = {
      cyberpunk:
        "Use neon purple (#b026ff) and pink (#ff2d95) as primary colors. Add glitch text effects, scanline overlays, and pulsing neon borders.",
      hardtek:
        "Use aggressive red (#ff2d55) and orange (#ff6b35) as primary colors. Add distorted grid patterns, heavy bold typography, and industrial textures.",
      jungle:
        "Use lush green (#39ff14) and teal (#00f0ff) as primary colors. Add organic flowing shapes, bass-wave animations, and tropical patterns.",
      minimal:
        "Use clean white (#ffffff) and cool gray (#a0a0a0) accents on dark backgrounds. Add subtle micro-animations, refined typography, and thin borders.",
    };

    const templateStyle = templateContext[template] || templateContext.cyberpunk;

    const fullPrompt = `${prompt}\n\nDesign style: ${templateStyle}`;

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: fullPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message ||
        `Mistral API error: ${response.status} ${response.statusText}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    let code = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    code = code.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();

    return NextResponse.json({ code });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
