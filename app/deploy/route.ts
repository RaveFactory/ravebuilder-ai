import { NextRequest, NextResponse } from "next/server";

const PAGE_FILENAMES: Record<string, string> = {
  home:    "index.html",
  event:   "event.html",
  tickets: "tickets.html",
  gallery: "gallery.html",
  faq:     "faq.html",
  blog:    "blog.html",
  contact: "contact.html",
};

const VERCEL_API = "https://api.vercel.com";

type ReadyState =
  | "INITIALIZING"
  | "ANALYZING"
  | "BUILDING"
  | "DEPLOYING"
  | "READY"
  | "ERROR"
  | "CANCELED";

export interface DeployResponse {
  url: string;
  customDomain?: string;
  aliasError?: string;
}

export interface DeployErrorResponse {
  error: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "ravebuilder-site";
}

function normaliseCustomDomain(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
}

export async function POST(req: NextRequest) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "VERCEL_TOKEN is not configured. Add it in the Secrets panel." },
      { status: 500 }
    );
  }

  let body: {
    pages?: Record<string, string>;
    projectName?: string;
    customDomain?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pages, projectName = "ravebuilder-site", customDomain: rawDomain } = body;

  if (!pages || typeof pages !== "object" || Object.keys(pages).length === 0) {
    return NextResponse.json(
      { error: "pages is required and must be a non-empty object" },
      { status: 400 }
    );
  }

  const safeProjectName = slugify(projectName);
  const customDomain    = rawDomain ? normaliseCustomDomain(rawDomain) : null;

  const files = Object.entries(pages).map(([pageId, html]) => ({
    file: PAGE_FILENAMES[pageId] ?? `${pageId}.html`,
    data: html,
    encoding: "utf-8",
  }));

  /* ── Create deployment ─────────────────────────────────────────────── */
  let createRes: Response;
  try {
    createRes = await fetch(`${VERCEL_API}/v13/deployments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: safeProjectName,
        files,
        projectSettings: {
          framework: null,
          buildCommand: null,
          devCommand: null,
          outputDirectory: null,
          installCommand: null,
        },
        target: "production",
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Vercel API. Check your network connection." },
      { status: 502 }
    );
  }

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "unknown error");
    let detail = errText;
    try {
      const parsed = JSON.parse(errText) as { error?: { message?: string } };
      detail = parsed.error?.message ?? errText;
    } catch { /* use raw text */ }
    return NextResponse.json(
      { error: `Vercel API returned ${createRes.status}: ${detail}` },
      { status: createRes.status }
    );
  }

  const created = await createRes.json() as {
    id: string;
    url: string;
    readyState?: ReadyState;
  };

  const { id, url } = created;
  if (!id || !url) {
    return NextResponse.json(
      { error: "Vercel did not return a valid deployment ID or URL." },
      { status: 502 }
    );
  }

  /* ── Poll until READY (max 90 s) ───────────────────────────────────── */
  let readyState: ReadyState = created.readyState ?? "INITIALIZING";
  const deadline = Date.now() + 90_000;

  while (
    readyState !== "READY" &&
    readyState !== "ERROR" &&
    readyState !== "CANCELED" &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const pollRes = await fetch(`${VERCEL_API}/v13/deployments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pollRes.ok) {
        const pollData = await pollRes.json() as { readyState?: ReadyState };
        readyState = pollData.readyState ?? readyState;
      }
    } catch {
      /* keep polling on transient errors */
    }
  }

  if (readyState === "ERROR") {
    return NextResponse.json(
      { error: "Vercel deployment failed. Check your Vercel dashboard for details." },
      { status: 502 }
    );
  }
  if (readyState === "CANCELED") {
    return NextResponse.json(
      { error: "Vercel deployment was cancelled." },
      { status: 502 }
    );
  }
  if (readyState !== "READY") {
    return NextResponse.json(
      {
        error: `Deployment timed out. Last state: ${readyState}. Check your Vercel dashboard — it may still be deploying.`,
      },
      { status: 504 }
    );
  }

  const liveUrl = url.startsWith("http") ? url : `https://${url}`;

  /* ── Assign custom domain alias (best-effort) ──────────────────────── */
  if (customDomain) {
    let aliasError: string | undefined;
    try {
      const aliasRes = await fetch(
        `${VERCEL_API}/v2/deployments/${id}/aliases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alias: customDomain }),
        }
      );
      if (!aliasRes.ok) {
        const aliasText = await aliasRes.text().catch(() => "unknown error");
        let detail = aliasText;
        try {
          const parsed = JSON.parse(aliasText) as { error?: { message?: string } };
          detail = parsed.error?.message ?? aliasText;
        } catch { /* use raw text */ }
        aliasError = `Could not assign custom domain: ${detail}`;
      }
    } catch {
      aliasError = "Could not reach Vercel alias API.";
    }

    if (aliasError) {
      return NextResponse.json({
        url: liveUrl,
        aliasError,
      } satisfies DeployResponse);
    }

    return NextResponse.json({
      url:          liveUrl,
      customDomain: `https://${customDomain}`,
    } satisfies DeployResponse);
  }

  return NextResponse.json({ url: liveUrl } satisfies DeployResponse);
}
