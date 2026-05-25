import { NextRequest, NextResponse } from "next/server";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const PAGE_FILENAMES: Record<string, string> = {
  home:    "index.html",
  event:   "event.html",
  tickets: "tickets.html",
  gallery: "gallery.html",
  faq:     "faq.html",
  blog:    "blog.html",
  contact: "contact.html",
};

const SYSTEM_PROMPT = `You are an expert web designer, developer, and SEO strategist who creates stunning multi-page websites.
You will receive a user description and a visual template style.

You MUST return a single valid JSON object — NOTHING ELSE. No markdown, no code fences, no preamble, no explanation.

Return exactly this structure:
{
  "pages": {
    "home":    "<complete self-contained HTML>",
    "event":   "<complete self-contained HTML>",
    "tickets": "<complete self-contained HTML>",
    "gallery": "<complete self-contained HTML>",
    "faq":     "<complete self-contained HTML>",
    "blog":    "<complete self-contained HTML>",
    "contact": "<complete self-contained HTML>"
  },
  "seo": {
    "title":       "SEO page title 50-60 chars",
    "description": "Meta description 140-160 chars with CTA",
    "keywords":    "keyword1, keyword2, keyword3, ... (8-12 keywords)"
  }
}

HTML RULES — apply to EVERY page:
- Each page is a COMPLETE standalone HTML document starting with <!DOCTYPE html>
- Include ALL CSS in a single <style> block in <head> — NO external stylesheets, NO CDN
- Include ALL JS in a single <script> block at end of <body> — NO external scripts
- Use ONLY system/web-safe fonts
- Mobile-first responsive layout with CSS flexbox/grid
- NAVIGATION: every page must have an identical <nav> linking to all 7 pages:
    <a href="index.html">Home</a>
    <a href="event.html">Event</a>
    <a href="tickets.html">Tickets</a>
    <a href="gallery.html">Gallery</a>
    <a href="faq.html">FAQ</a>
    <a href="blog.html">Blog</a>
    <a href="contact.html">Contact</a>
- FOOTER: identical minimal footer on every page
- Every page needs: an H1, at least two H2s, and relevant placeholder content
- COMPACT: do NOT add unnecessary comments or whitespace — keep HTML tight

PAGE-SPECIFIC content requirements:
- home: hero section, feature highlights, CTA button, brief about
- event: upcoming events list/grid, event details, dates, venues
- tickets: ticket tiers (e.g. Early Bird, General, VIP), prices, buy CTA
- gallery: image grid (use CSS-generated colored placeholder blocks), caption each
- faq: accordion or list of 6-8 Q&A pairs relevant to the site topic
- blog: 3 blog post cards with title, excerpt, date, read-more link
- contact: contact form (name, email, message, submit), social links, map placeholder

SEO RULES for the "seo" field:
- title: primary keyword near start, under 60 chars
- description: primary + secondary keyword, ends with action phrase, 140-160 chars
- keywords: most important first, include niche/location terms if relevant`;

const TEMPLATE_STYLES: Record<string, string> = {
  cyberpunk: `VISUAL THEME: Cyberpunk / Dark Neon
CSS variables to use: --bg:#0a0a0f; --bg2:#12121c; --accent:#b026ff; --accent2:#26f0ff; --text:#e8d4ff; --muted:#8b7aab; --border:rgba(176,38,255,0.25)
- Dark background, neon purple & cyan accents
- Monospace/system-ui fonts, uppercase headings with letter-spacing
- Glowing borders (box-shadow with accent colour), neon text-shadow on headings
- Grid lines, scanline-style borders, angular high-tech shapes
- Nav: dark sticky bar with neon accent links`,

  hardtek: `VISUAL THEME: Hardtek / Industrial Rave
CSS variables to use: --bg:#0d0704; --bg2:#160c06; --accent:#ff3a00; --accent2:#ff8800; --text:#f0d0c0; --muted:#8a5a4a; --border:rgba(255,58,0,0.25)
- Very dark warm background, orange/red neon accents
- Bold heavy sans-serif typography, aggressive uppercase
- Industrial distressed aesthetic, heavy borders, mechanical shapes
- High-energy intense visual style`,

  jungle: `VISUAL THEME: Jungle / Deep Bass
CSS variables to use: --bg:#030d06; --bg2:#061408; --accent:#00ff87; --accent2:#00cc60; --text:#d0f0e0; --muted:#4a8a6a; --border:rgba(0,255,135,0.25)
- Deep dark green background, neon green accents
- Organic layered aesthetic, mix of digital and natural
- Dense lush visual style, underground rave energy`,

  minimal: `VISUAL THEME: Minimal / Clean
CSS variables to use: --bg:#0a0a0a; --bg2:#141414; --accent:#e0e0e0; --accent2:#ffffff; --text:#e0e0e0; --muted:#888888; --border:rgba(255,255,255,0.12)
- Near-black background, white/light gray text and accents
- Swiss-style grid, generous whitespace, thin borders
- Light font weights, elegant restrained typography`,
};

/* ─── Single-page content guide ─────────────────────────────────────── */

const SINGLE_PAGE_CONTENT: Record<string, string> = {
  home:    "Hero section with H1 tagline and CTA button, 3-4 feature/highlight cards, brief about blurb, and a call-to-action banner above the footer.",
  event:   "Upcoming events grid or list (4-6 events) with event name, date, venue, short description, and 'Get Tickets' CTA for each.",
  tickets: "Ticket tier cards (Early Bird, General Admission, VIP) with price, included perks list, and a prominent Buy button. Add a FAQ-style 'What's included?' section below.",
  gallery: "Masonry or uniform image grid (12+ items) using CSS-generated colored gradient placeholder blocks. Each item has a short caption. Lightbox-style click effect using vanilla JS.",
  faq:     "6-8 accordion-style Q&A pairs relevant to the site topic. Each question toggles the answer open/closed with smooth CSS or JS transition.",
  blog:    "3 blog post preview cards: each with a coloured header block, title (H2), excerpt (2-3 lines), published date, author name, and 'Read More' link.",
  contact: "Contact form with name, email, subject, and message fields plus a Submit button. Social media icon links (text-based). A coloured CSS block acting as an embedded map placeholder.",
};

const SINGLE_PAGE_SYSTEM = `You are an expert web designer creating ONE specific page of a 7-page website.

You MUST return a single valid JSON object — NOTHING ELSE. No markdown, no code fences.

Return exactly:
{ "html": "<complete standalone HTML page>" }

HTML RULES:
- Complete document starting with <!DOCTYPE html>
- All CSS in a single <style> block — no external stylesheets or CDN
- All JS in a single <script> block at end of <body>
- System/web-safe fonts only
- Mobile-first responsive layout
- Include a consistent <nav> linking to ALL pages:
    <a href="index.html">Home</a>
    <a href="event.html">Event</a>
    <a href="tickets.html">Tickets</a>
    <a href="gallery.html">Gallery</a>
    <a href="faq.html">FAQ</a>
    <a href="blog.html">Blog</a>
    <a href="contact.html">Contact</a>
- Include an H1, at least two H2s, and a footer
- Visually polished and production-ready`;

export interface GenerateResponse {
  pages: Record<string, string>;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface RegeneratePageResponse {
  html: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: { prompt?: string; template?: string; page?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, template = "cyberpunk", page } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const templateStyle =
    TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.cyberpunk;

  /* ── Single-page regeneration mode ─────────────────────────────────── */
  if (page && typeof page === "string" && PAGE_FILENAMES[page]) {
    const pageLabel    = page.charAt(0).toUpperCase() + page.slice(1);
    const pageContent  = SINGLE_PAGE_CONTENT[page] ?? `Complete ${pageLabel} page content.`;
    const userMsgSingle = `Regenerate the ${pageLabel} page for this website: ${prompt.trim()}

${templateStyle}

PAGE-SPECIFIC CONTENT for ${pageLabel}: ${pageContent}

Return the JSON object now with just the "html" key.`;

    let singleRes: Response;
    try {
      singleRes = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: SINGLE_PAGE_SYSTEM },
            { role: "user",   content: userMsgSingle },
          ],
          temperature: 0.75,
          max_tokens: 2500,
          response_format: { type: "json_object" },
        }),
      });
    } catch {
      return NextResponse.json({ error: "Failed to reach Mistral API." }, { status: 502 });
    }

    if (!singleRes.ok) {
      const errText = await singleRes.text().catch(() => "unknown error");
      return NextResponse.json({ error: `Mistral API error ${singleRes.status}: ${errText}` }, { status: singleRes.status });
    }

    let singleData: { choices?: Array<{ message?: { content?: string } }> };
    try { singleData = await singleRes.json(); }
    catch { return NextResponse.json({ error: "Failed to parse Mistral response." }, { status: 502 }); }

    const singleRaw = singleData.choices?.[0]?.message?.content ?? "";
    const singleCleaned = singleRaw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let singleParsed: { html?: string };
    try { singleParsed = JSON.parse(singleCleaned) as { html?: string }; }
    catch { return NextResponse.json({ error: "Mistral did not return valid JSON for this page." }, { status: 422 }); }

    const html = singleParsed.html ?? "";
    if (!html.toLowerCase().includes("<!doctype")) {
      return NextResponse.json({ error: "Mistral did not return valid HTML for this page." }, { status: 422 });
    }

    return NextResponse.json({ html } satisfies RegeneratePageResponse);
  }

  /* ── Full 7-page generation mode ────────────────────────────────────── */
  const userMessage = `Create a complete 7-page website for: ${prompt.trim()}

${templateStyle}

Return the JSON object now. Every page must be a complete standalone HTML document with the shared nav. Keep each page compact but fully functional and visually polished.`;

  let mistralRes: Response;
  try {
    mistralRes = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      }),
    });
  } catch (err) {
    console.error("Mistral fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach Mistral API. Check your network." },
      { status: 502 }
    );
  }

  if (!mistralRes.ok) {
    const errorText = await mistralRes.text().catch(() => "unknown error");
    console.error("Mistral API error:", mistralRes.status, errorText);
    return NextResponse.json(
      { error: `Mistral API returned ${mistralRes.status}: ${errorText}` },
      { status: mistralRes.status }
    );
  }

  let apiData: { choices?: Array<{ message?: { content?: string } }> };
  try {
    apiData = await mistralRes.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Mistral API response" },
      { status: 502 }
    );
  }

  const rawContent = apiData.choices?.[0]?.message?.content ?? "";

  const cleaned = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: GenerateResponse;
  try {
    parsed = JSON.parse(cleaned) as GenerateResponse;
  } catch {
    return NextResponse.json(
      { error: "Mistral did not return valid JSON. Try rephrasing your prompt." },
      { status: 422 }
    );
  }

  // Validate at least home page exists
  if (!parsed.pages?.home || !parsed.pages.home.toLowerCase().includes("<!doctype")) {
    return NextResponse.json(
      { error: "Mistral did not generate valid HTML pages. Try rephrasing your prompt." },
      { status: 422 }
    );
  }

  // Ensure all expected page keys exist, fill missing with empty string
  const pages: Record<string, string> = {};
  for (const key of Object.keys(PAGE_FILENAMES)) {
    pages[key] = parsed.pages[key] ?? "";
  }

  return NextResponse.json({
    pages,
    seo: {
      title:       parsed.seo?.title       ?? "",
      description: parsed.seo?.description ?? "",
      keywords:    parsed.seo?.keywords    ?? "",
    },
  } satisfies GenerateResponse);
}
