"use client";

import { useState } from "react";
import { strToU8, zip as fflateZip } from "fflate";
import { useHistory } from "./hooks/useHistory";
import { useDeployHistory } from "./hooks/useDeployHistory";
import { HistoryPanel } from "./components/HistoryPanel";
import { DeployHistoryPanel } from "./components/DeployHistoryPanel";
import type { HistoryEntry, SeoData, Template } from "./hooks/useHistory";

/* ─── Constants ──────────────────────────────────────────────────────── */

interface TemplateCard {
  id: Template;
  name: string;
  emoji: string;
  description: string;
  accent: string;
  previewClass: string;
}

const TEMPLATES: TemplateCard[] = [
  { id: "cyberpunk", name: "Cyberpunk", emoji: "⚡", description: "Neon glows, dark grids, electric energy", accent: "#b026ff", previewClass: "bg-gradient-to-br from-purple-950 via-black to-cyan-950" },
  { id: "hardtek",  name: "Hardtek",  emoji: "🔊", description: "Industrial beats, raw power, heavy bass",  accent: "#ff3a00", previewClass: "bg-gradient-to-br from-orange-950 via-black to-red-950"   },
  { id: "jungle",   name: "Jungle",   emoji: "🌿", description: "Deep bass, organic chaos, wild rhythms",   accent: "#00ff87", previewClass: "bg-gradient-to-br from-green-950 via-black to-emerald-950" },
  { id: "minimal",  name: "Minimal",  emoji: "◻",  description: "Clean lines, pure form, quiet power",      accent: "#e0e0e0", previewClass: "bg-gradient-to-br from-zinc-900 via-black to-zinc-900"    },
];

interface PageTab {
  id: string;
  label: string;
  icon: string;
  filename: string;
}

const PAGE_TABS: PageTab[] = [
  { id: "home",    label: "HOME",    icon: "⌂", filename: "index.html"   },
  { id: "event",   label: "EVENT",   icon: "◉", filename: "event.html"   },
  { id: "tickets", label: "TICKETS", icon: "◈", filename: "tickets.html" },
  { id: "gallery", label: "GALLERY", icon: "▣", filename: "gallery.html" },
  { id: "faq",     label: "FAQ",     icon: "?", filename: "faq.html"     },
  { id: "blog",    label: "BLOG",    icon: "◧", filename: "blog.html"    },
  { id: "contact", label: "CONTACT", icon: "✉", filename: "contact.html" },
];

const LOADING_MESSAGES = [
  "NEURAL SYNTHESIS ACTIVE",
  "GENERATING HOME PAGE...",
  "BUILDING EVENT PAGE...",
  "CONSTRUCTING TICKETS PAGE...",
  "RENDERING GALLERY PAGE...",
  "ANALYSING SEO SIGNALS...",
  "COMPILING FULL WEBSITE...",
];

/* ─── SEO Score ──────────────────────────────────────────────────────── */

interface ScoreBreakdown {
  titleScore: number;
  descScore: number;
  keywordScore: number;
  contentScore: number;
  total: number;
  grade: "S" | "A" | "B" | "C" | "D";
  gradeColor: string;
}

function calcSeoScore(seo: SeoData, pages: Record<string, string>): ScoreBreakdown {
  const titleLen = seo.title.trim().length;
  const descLen  = seo.description.trim().length;
  const kwCount  = seo.keywords.split(",").map((k) => k.trim()).filter(Boolean).length;
  const totalHtmlLen = Object.values(pages).join("").length;

  const titleScore   = titleLen >= 50 && titleLen <= 60 ? 30 : titleLen >= 40 && titleLen <= 70 ? 20 : 10;
  const descScore    = descLen  >= 140 && descLen  <= 160 ? 30 : descLen  >= 120 && descLen  <= 180 ? 20 : 10;
  const keywordScore = kwCount  >= 8  && kwCount  <= 12 ? 20 : kwCount  >= 5  && kwCount  <= 14 ? 14 : 7;
  const contentScore = totalHtmlLen > 30000 ? 20 : totalHtmlLen > 15000 ? 14 : 8;

  const total = titleScore + descScore + keywordScore + contentScore;
  const grade = total >= 90 ? "S" : total >= 78 ? "A" : total >= 64 ? "B" : total >= 50 ? "C" : "D";
  const gradeColor = grade === "S" ? "#26f0ff" : grade === "A" ? "#00ff87" : grade === "B" ? "#b026ff" : grade === "C" ? "#ffaa00" : "#ff4444";

  return { titleScore, descScore, keywordScore, contentScore, total, grade, gradeColor };
}

function SeoPanel({ seo, pages }: { seo: SeoData; pages: Record<string, string> }) {
  const score    = calcSeoScore(seo, pages);
  const keywords = seo.keywords.split(",").map((k) => k.trim()).filter(Boolean);
  const pageCount = Object.values(pages).filter(Boolean).length;

  const metrics = [
    { label: "TITLE",       pts: score.titleScore,   max: 30, hint: `${seo.title.length} chars (ideal 50–60)` },
    { label: "DESCRIPTION", pts: score.descScore,    max: 30, hint: `${seo.description.length} chars (ideal 140–160)` },
    { label: "KEYWORDS",    pts: score.keywordScore, max: 20, hint: `${keywords.length} terms` },
    { label: "CONTENT",     pts: score.contentScore, max: 20, hint: `${pageCount} pages generated` },
  ];

  return (
    <div className="seo-panel">
      <div className="seo-panel-header">
        <span className="seo-panel-label">// SEO ANALYSIS</span>
        <div className="seo-score-badge" style={{ "--grade-color": score.gradeColor } as React.CSSProperties}>
          <span className="seo-score-number">{score.total}</span>
          <span className="seo-score-sep">/</span>
          <span className="seo-score-max">100</span>
          <span className="seo-grade" style={{ color: score.gradeColor }}>{score.grade}</span>
        </div>
      </div>

      <div className="seo-bar-track">
        <div className="seo-bar-fill" style={{ width: `${score.total}%`, background: score.gradeColor }} />
      </div>

      <div className="seo-metrics">
        {metrics.map((m) => (
          <div key={m.label} className="seo-metric-row">
            <div className="seo-metric-left">
              <span className="seo-metric-label">{m.label}</span>
              <span className="seo-metric-hint">{m.hint}</span>
            </div>
            <div className="seo-metric-right">
              <div className="seo-mini-bar-track">
                <div className="seo-mini-bar-fill" style={{ width: `${(m.pts / m.max) * 100}%`, background: score.gradeColor }} />
              </div>
              <span className="seo-metric-pts" style={{ color: score.gradeColor }}>{m.pts}/{m.max}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="seo-divider" />

      <div className="seo-fields">
        <div className="seo-field">
          <div className="seo-field-label">
            <span>SEO TITLE</span>
            <span className={`seo-field-len ${seo.title.length >= 50 && seo.title.length <= 60 ? "good" : seo.title.length > 0 ? "warn" : ""}`}>{seo.title.length}/60</span>
          </div>
          <p className="seo-field-value seo-title-value">{seo.title || "—"}</p>
        </div>
        <div className="seo-field">
          <div className="seo-field-label">
            <span>META DESCRIPTION</span>
            <span className={`seo-field-len ${seo.description.length >= 140 && seo.description.length <= 160 ? "good" : seo.description.length > 0 ? "warn" : ""}`}>{seo.description.length}/160</span>
          </div>
          <p className="seo-field-value">{seo.description || "—"}</p>
        </div>
        <div className="seo-field">
          <div className="seo-field-label">
            <span>KEYWORDS</span>
            <span className="seo-field-len">{keywords.length} terms</span>
          </div>
          <div className="seo-keywords">
            {keywords.map((kw, i) => <span key={i} className="seo-keyword-tag">{kw}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ZIP export (all pages) ────────────────────────────────────────── */

function exportAllZip(pages: Record<string, string>, template: string) {
  const slug = `ravebuilder-${template}-${Date.now()}`;
  const PAGE_FILENAMES: Record<string, string> = {
    home: "index.html", event: "event.html", tickets: "tickets.html",
    gallery: "gallery.html", faq: "faq.html", blog: "blog.html", contact: "contact.html",
  };
  const files: Record<string, Uint8Array> = {};
  for (const [key, html] of Object.entries(pages)) {
    if (!html) continue;
    files[`${slug}/${PAGE_FILENAMES[key] ?? `${key}.html`}`] = strToU8(html);
  }
  fflateZip(files, (err, data) => {
    if (err) return;
    const url = URL.createObjectURL(new Blob([data], { type: "application/zip" }));
    Object.assign(document.createElement("a"), { href: url, download: `${slug}.zip` }).click();
    URL.revokeObjectURL(url);
  });
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function Page() {
  const handleGenerate = async () => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt
      })
    });

    const raw = await response.json();

console.log(raw);

const content =
  raw?.choices?.[0]?.message?.content || "{}";

const data = JSON.parse(content);

console.log(data);

alert("Website generated successfully!");
  } catch (error) {
    console.error(error);

    alert("Generation failed");
  }
};  const [selectedTemplate, setSelectedTemplate] = useState<Template>("cyberpunk");
  const [prompt, setPrompt]             = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pages, setPages]               = useState<Record<string, string>>({});
  const [activePage, setActivePage]     = useState("home");
  const [seoData, setSeoData]           = useState<SeoData | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg]     = useState(LOADING_MESSAGES[0]);
  const [historyOpen, setHistoryOpen]       = useState(false);
  const [isRegeneratingPage, setIsRegeneratingPage] = useState(false);
  const [pageRegenError, setPageRegenError]         = useState<string | null>(null);

  type DeployStatus = "idle" | "deploying" | "live" | "error";
  const DEPLOY_STEPS = [
    "Preparing build...",
    "Uploading files...",
    "Deploying to edge...",
    "Going live...",
  ];
  const [deployStatus,          setDeployStatus]          = useState<DeployStatus>("idle");
  const [deployUrl,             setDeployUrl]             = useState<string | null>(null);
  const [deployError,           setDeployError]           = useState<string | null>(null);
  const [deployStep,            setDeployStep]            = useState(0);
  const [deployProjectName,     setDeployProjectName]     = useState("");
  const [deployCustomDomain,    setDeployCustomDomain]    = useState("");
  const [deployLiveCustomDomain,setDeployLiveCustomDomain]= useState<string | null>(null);
  const [deployAliasWarning,    setDeployAliasWarning]    = useState<string | null>(null);
  const [deployHistoryOpen,     setDeployHistoryOpen]     = useState(false);
  const [currentGenerationId,   setCurrentGenerationId]   = useState<string | undefined>(undefined);

  const { history, addEntry, deleteEntry, duplicateEntry } = useHistory();
  const { deployHistory, addDeployEntry, deleteDeployEntry, clearDeployHistory } = useDeployHistory();
  const selectedCard = TEMPLATES.find((t) => t.id === selectedTemplate)!;
  const canGenerate  = prompt.trim().length > 0 && !isGenerating;
  const currentHtml  = pages[activePage] ?? "";
  const pageCount    = Object.values(pages).filter(Boolean).length;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    setPages({});
    setSeoData(null);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 1800);

    try {
      const res  = await fetch("/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt: prompt.trim(), template: selectedTemplate }),
      });
      const data = await res.json() as {
        pages?: Record<string, string>;
        seo?: { title?: string; description?: string; keywords?: string };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);

      const newPages = data.pages ?? {};
      const seo: SeoData = {
        title:       data.seo?.title       ?? "",
        description: data.seo?.description ?? "",
        keywords:    data.seo?.keywords    ?? "",
      };

      setPages(newPages);
      setSeoData(seo);
      setHasGenerated(true);
      setActivePage("home");

      const newEntry = addEntry({ prompt: prompt.trim(), template: selectedTemplate, pages: newPages, seo });
      setCurrentGenerationId(newEntry.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      clearInterval(msgInterval);
      setIsGenerating(false);
      setLoadingMsg(LOADING_MESSAGES[0]);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setPages(entry.pages ?? {});
    setSeoData(entry.seo ?? null);
    setSelectedTemplate(entry.template);
    setPrompt(entry.prompt);
    setHasGenerated(true);
    setActivePage("home");
    setError(null);
    setPageRegenError(null);
    setCurrentGenerationId(entry.id);
  };

  const autoProjectName = prompt
    .trim()
    .slice(0, 30)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "ravebuilder-site";

  const effectiveProjectName = deployProjectName.trim() || autoProjectName;

  /* ── Shared deploy engine ───────────────────────────────────────────── */
  const runDeploy = async (
    pagesToDeploy: Record<string, string>,
    projectName:   string,
    rawDomain:     string,
    meta: { promptText: string; templateId: string; generationId?: string }
  ) => {
    setDeployStatus("deploying");
    setDeployUrl(null);
    setDeployError(null);
    setDeployAliasWarning(null);
    setDeployLiveCustomDomain(null);
    setDeployStep(0);

    const stepInterval = setInterval(() => {
      setDeployStep((prev) => Math.min(prev + 1, DEPLOY_STEPS.length - 1));
    }, 8000);

    try {
      const body: Record<string, unknown> = { pages: pagesToDeploy, projectName };
      const trimmedDomain = rawDomain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
      if (trimmedDomain) body.customDomain = trimmedDomain;

      const res  = await fetch("/deploy", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as {
        url?: string; customDomain?: string; aliasError?: string; error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      if (!data.url) throw new Error("No deployment URL returned.");
      setDeployUrl(data.url);
      if (data.customDomain) setDeployLiveCustomDomain(data.customDomain);
      if (data.aliasError)   setDeployAliasWarning(data.aliasError);
      setDeployStatus("live");
      addDeployEntry({
        url:          data.url,
        customDomain: data.customDomain,
        projectName,
        pageCount:    Object.keys(pagesToDeploy).length,
        prompt:       meta.promptText,
        template:     meta.templateId,
        generationId: meta.generationId,
      });
    } catch (err: unknown) {
      setDeployError(err instanceof Error ? err.message : "Unknown error");
      setDeployStatus("error");
    } finally {
      clearInterval(stepInterval);
    }
  };

  const handleDeploy = () => {
    if (deployStatus === "deploying" || Object.keys(pages).length === 0) return;
    runDeploy(pages, effectiveProjectName, deployCustomDomain, {
      promptText:   prompt.trim(),
      templateId:   selectedTemplate,
      generationId: currentGenerationId,
    });
  };

  const handleRedeployFromHistory = (entry: import("./hooks/useDeployHistory").DeployEntry) => {
    const genEntry = history.find((e) => e.id === entry.generationId);
    if (!genEntry) {
      setDeployHistoryOpen(false);
      setDeployError(
        `Pages for "${entry.projectName}" are no longer in generation history. ` +
        "Load or regenerate the site first, then deploy."
      );
      return;
    }

    setDeployHistoryOpen(false);

    // Restore the generation visually
    setPages(genEntry.pages ?? {});
    setSeoData(genEntry.seo ?? null);
    setSelectedTemplate(genEntry.template);
    setPrompt(genEntry.prompt);
    setHasGenerated(true);
    setActivePage("home");
    setError(null);
    setCurrentGenerationId(genEntry.id);

    // Pre-fill deploy form with saved settings
    setDeployProjectName(entry.projectName);
    setDeployCustomDomain(
      entry.customDomain ? entry.customDomain.replace("https://", "") : ""
    );

    // Run deploy immediately with exact saved pages + settings
    runDeploy(genEntry.pages ?? {}, entry.projectName, entry.customDomain?.replace("https://", "") ?? "", {
      promptText:   genEntry.prompt,
      templateId:   genEntry.template,
      generationId: genEntry.id,
    });
  };

  const handleRegeneratePage = async () => {
    if (!prompt.trim() || isGenerating || isRegeneratingPage) return;
    setIsRegeneratingPage(true);
    setPageRegenError(null);

    try {
      const res  = await fetch("/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt: prompt.trim(), template: selectedTemplate, page: activePage }),
      });
      const data = await res.json() as { html?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      if (!data.html) throw new Error("No HTML returned for this page.");

      setPages((prev) => ({ ...prev, [activePage]: data.html! }));
    } catch (err: unknown) {
      setPageRegenError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsRegeneratingPage(false);
    }
  };

  const handleExportZip = () => {
    if (Object.keys(pages).length === 0) return;
    exportAllZip(pages, selectedTemplate);
  };

  return (
    <main className="min-h-screen">
      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid rgba(176,38,255,0.2)", background: "rgba(10,10,15,0.95)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="logo-glitch" style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase" }}>
            <span style={{ color: "#b026ff" }}>Rave</span>
            <span style={{ color: "#e8d4ff" }}>Builder</span>
            <span style={{ color: "#26f0ff", fontSize: "14px", marginLeft: "6px", fontWeight: 400 }}>AI</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{ position: "relative", background: "transparent", border: "1px solid rgba(176,38,255,0.35)", color: "#8b7aab", borderRadius: "4px", padding: "5px 14px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              ◈ HISTORY
              {history.length > 0 && (
                <span style={{ background: "#b026ff", color: "white", borderRadius: "8px", padding: "1px 6px", fontSize: "9px", fontWeight: 700 }}>
                  {history.length}
                </span>
              )}
            </button>
            <span className="pulse-badge" style={{ background: "rgba(176,38,255,0.15)", border: "1px solid rgba(176,38,255,0.4)", color: "#b026ff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", letterSpacing: "2px", fontWeight: 600 }}>
              ● MISTRAL
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "60px 20px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "11px", letterSpacing: "6px", color: "#8b7aab", textTransform: "uppercase", marginBottom: "16px" }}>⚡ AI-Powered Multi-Page Website Generation</div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "16px" }}>
          Build Full Websites That{" "}
          <span className="neon-text" style={{ display: "inline-block" }}>Pulse</span>{" "}
          With Energy
        </h1>
        <p style={{ fontSize: "16px", color: "#8b7aab", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
          One prompt generates 7 complete pages — Home, Event, Tickets, Gallery, FAQ, Blog & Contact — with SEO analysis.
        </p>
      </section>

      {/* ── Main Builder ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 80px", display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>

        {/* ── Left: Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "3px", color: "#8b7aab", textTransform: "uppercase", marginBottom: "10px" }}>
              // Describe Your Website
            </label>
            <textarea
              className="cyber-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder="A nightclub website for an underground rave collective in Berlin. Dark atmosphere, event listings, artist roster, ticket booking..."
              rows={5}
              style={{ width: "100%", padding: "16px", borderRadius: "4px", fontSize: "14px", lineHeight: 1.6 }}
            />
            <div style={{ fontSize: "10px", color: "#4a3a6a", marginTop: "6px", letterSpacing: "1px" }}>⌘/Ctrl + Enter to generate · Generates all 7 pages at once</div>
          </div>

          {/* Template grid */}
          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "3px", color: "#8b7aab", textTransform: "uppercase", marginBottom: "10px" }}>
              // Select Template
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`template-card ${selectedTemplate === t.id ? "selected" : ""}`}
                  style={{ padding: "16px", borderRadius: "6px", textAlign: "left", cursor: "pointer", width: "100%" }}
                >
                  <div className={t.previewClass} style={{ height: "48px", borderRadius: "3px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    {t.emoji}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: selectedTemplate === t.id ? t.accent : "#e8d4ff", marginBottom: "4px", transition: "color 0.2s" }}>{t.name}</div>
                  <div style={{ fontSize: "11px", color: "#8b7aab", lineHeight: 1.4 }}>{t.description}</div>
                  {selectedTemplate === t.id && <div style={{ marginTop: "8px", fontSize: "10px", letterSpacing: "2px", color: t.accent }}>✓ SELECTED</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            className="neon-glow-btn"
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{ width: "100%", padding: "16px", borderRadius: "4px", border: "none", color: "white", fontWeight: 700, fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", cursor: canGenerate ? "pointer" : "not-allowed", opacity: canGenerate ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
          >
            {isGenerating ? (
              <>
                <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                GENERATING 7 PAGES...
              </>
            ) : <>⚡ GENERATE FULL WEBSITE (7 PAGES)</>}
          </button>

          {/* Page map legend */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {PAGE_TABS.map((tab) => (
              <div key={tab.id} style={{ background: "rgba(176,38,255,0.05)", border: "1px solid rgba(176,38,255,0.12)", borderRadius: "4px", padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", marginBottom: "2px" }}>{tab.icon}</div>
                <div style={{ fontSize: "9px", letterSpacing: "1px", color: "#4a3a6a" }}>{tab.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Preview + SEO ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Page tab switcher */}
          {(hasGenerated || isGenerating) && (
            <div className="page-tabs-bar">
              {PAGE_TABS.map((tab) => {
                const isActive  = activePage === tab.id;
                const hasContent = !!pages[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => { if (hasContent) setActivePage(tab.id); }}
                    disabled={!hasContent || isGenerating}
                    className={`page-tab ${isActive ? "active" : ""} ${!hasContent ? "empty" : ""}`}
                    title={hasContent ? tab.filename : "Not generated yet"}
                  >
                    <span className="page-tab-icon">{tab.icon}</span>
                    <span className="page-tab-label">{tab.label}</span>
                    {hasContent && (
                      <span className="page-tab-dot" style={{ background: isActive ? selectedCard.accent : "rgba(176,38,255,0.4)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Live Preview */}
          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "3px", color: "#8b7aab", textTransform: "uppercase", marginBottom: "10px" }}>
              // Live Preview
              {hasGenerated && !isGenerating && !error && (
                <span style={{ marginLeft: "12px", color: selectedCard.accent, fontSize: "10px" }}>
                  ● {PAGE_TABS.find((t) => t.id === activePage)?.label ?? activePage.toUpperCase()} · {pageCount}/7 PAGES
                </span>
              )}
            </label>

            <div className="preview-area" style={{ borderRadius: "6px", overflow: "hidden", minHeight: "520px", position: "relative" }}>
              {/* Empty */}
              {!hasGenerated && !isGenerating && !error && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "#8b7aab" }}>
                  <div style={{ fontSize: "48px", opacity: 0.2 }}>◻</div>
                  <div style={{ fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}>Preview will appear here</div>
                  <div style={{ fontSize: "11px", color: "#4a3a6a" }}>Enter a prompt and generate your 7-page site</div>
                </div>
              )}

              {/* Loading */}
              {isGenerating && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", background: "rgba(10,10,15,0.97)", zIndex: 10 }}>
                  <div style={{ position: "relative", width: "64px", height: "64px" }}>
                    <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(176,38,255,0.15)", borderTop: "2px solid #b026ff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <div style={{ position: "absolute", inset: "10px", border: "1px solid rgba(38,240,255,0.15)", borderBottom: "1px solid #26f0ff", borderRadius: "50%", animation: "spin 1.5s linear infinite reverse" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#b026ff", fontSize: "13px", letterSpacing: "3px", fontWeight: 700 }}>{loadingMsg}</div>
                    <div style={{ color: "#4a3a6a", fontSize: "11px", letterSpacing: "2px", marginTop: "8px" }}>Building all 7 {selectedCard.name} pages with Mistral AI...</div>
                  </div>
                  {/* Page progress indicators */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {PAGE_TABS.map((tab) => (
                      <div key={tab.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <div style={{ width: "28px", height: "28px", border: "1px solid rgba(176,38,255,0.2)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", animation: `pulse-neon 1.2s ease-in-out ${PAGE_TABS.indexOf(tab) * 0.2}s infinite` }}>
                          {tab.icon}
                        </div>
                        <div style={{ fontSize: "7px", color: "#4a3a6a", letterSpacing: "0.5px" }}>{tab.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !isGenerating && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
                  <div style={{ border: "1px solid rgba(255,50,50,0.4)", background: "rgba(255,50,50,0.06)", borderRadius: "6px", padding: "24px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
                    <div style={{ color: "#ff4444", fontSize: "20px", marginBottom: "12px" }}>⚠</div>
                    <div style={{ color: "#ff6666", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>GENERATION FAILED</div>
                    <div style={{ color: "#cc8888", fontSize: "13px", lineHeight: 1.5 }}>{error}</div>
                    <button onClick={handleGenerate} style={{ marginTop: "20px", padding: "10px 24px", background: "transparent", border: "1px solid rgba(255,50,50,0.4)", color: "#ff6666", borderRadius: "4px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase" }}>
                      ↻ RETRY
                    </button>
                  </div>
                </div>
              )}

              {/* Per-page regeneration overlay */}
              {isRegeneratingPage && !isGenerating && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "rgba(10,10,15,0.88)", zIndex: 10, backdropFilter: "blur(2px)" }}>
                  <div style={{ position: "relative", width: "48px", height: "48px" }}>
                    <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(38,240,255,0.15)", borderTop: "2px solid #26f0ff", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
                    <div style={{ position: "absolute", inset: "8px", border: "1px solid rgba(176,38,255,0.15)", borderBottom: "1px solid #b026ff", borderRadius: "50%", animation: "spin 1.4s linear infinite reverse" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#26f0ff", fontSize: "12px", letterSpacing: "3px", fontWeight: 700 }}>
                      REGENERATING {(PAGE_TABS.find((t) => t.id === activePage)?.label ?? activePage).toUpperCase()} PAGE
                    </div>
                    <div style={{ color: "#4a3a6a", fontSize: "10px", letterSpacing: "2px", marginTop: "6px" }}>
                      Other pages are untouched
                    </div>
                  </div>
                </div>
              )}

              {/* Preview iframe */}
              {!isGenerating && currentHtml && !error && (
                <iframe key={`${activePage}-${isRegeneratingPage ? "loading" : "ready"}`} srcDoc={currentHtml} style={{ width: "100%", height: "520px", border: "none", display: "block", opacity: isRegeneratingPage ? 0.25 : 1, transition: "opacity 0.2s" }} title={`${activePage} preview`} sandbox="allow-scripts" />
              )}
            </div>

            {/* Action bar */}
            {hasGenerated && !isGenerating && !error && (
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Page regen row */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={handleRegeneratePage}
                    disabled={isRegeneratingPage || !prompt.trim()}
                    style={{
                      flex: 1, padding: "10px 14px",
                      background: isRegeneratingPage ? "rgba(38,240,255,0.06)" : "rgba(38,240,255,0.04)",
                      border: `1px solid ${isRegeneratingPage ? "rgba(38,240,255,0.5)" : "rgba(38,240,255,0.3)"}`,
                      color: isRegeneratingPage ? "#26f0ff" : "#5ad4e8",
                      borderRadius: "4px", fontSize: "11px", letterSpacing: "2px",
                      cursor: isRegeneratingPage || !prompt.trim() ? "not-allowed" : "pointer",
                      textTransform: "uppercase", opacity: !prompt.trim() ? 0.4 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {isRegeneratingPage ? (
                      <>
                        <span style={{ display: "inline-block", width: "12px", height: "12px", border: "1.5px solid rgba(38,240,255,0.3)", borderTop: "1.5px solid #26f0ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        REGENERATING {(PAGE_TABS.find((t) => t.id === activePage)?.label ?? activePage).toUpperCase()}...
                      </>
                    ) : (
                      <>↻ Regen {PAGE_TABS.find((t) => t.id === activePage)?.label ?? activePage} Page Only</>
                    )}
                  </button>
                  <div style={{ fontSize: "9px", color: "#4a3a6a", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                    other pages stay
                  </div>
                </div>

                {/* Page regen error */}
                {pageRegenError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "4px" }}>
                    <span style={{ color: "#ff6666", fontSize: "11px" }}>⚠ {pageRegenError}</span>
                    <button onClick={() => setPageRegenError(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#ff6666", cursor: "pointer", fontSize: "11px" }}>✕</button>
                  </div>
                )}

                {/* Site-level actions */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={handleGenerate} style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid rgba(176,38,255,0.4)", color: "#b026ff", borderRadius: "4px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", minWidth: "100px" }}>
                    ↻ Regen All 7 Pages
                  </button>
                  <button onClick={handleExportZip} style={{ flex: 2, padding: "10px", background: "transparent", border: "1px solid rgba(38,240,255,0.4)", color: "#26f0ff", borderRadius: "4px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", minWidth: "140px" }}>
                    ⬇ Export Full Site ZIP ({pageCount} pages)
                  </button>
                  <button onClick={() => setHistoryOpen(true)} style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid rgba(176,38,255,0.4)", color: "#b026ff", borderRadius: "4px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", minWidth: "100px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    ◈ History {history.length > 0 && <span style={{ background: "#b026ff", color: "white", borderRadius: "8px", padding: "0 5px", fontSize: "9px", fontWeight: 700 }}>{history.length}</span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Deploy Panel ─────────────────────────────────────────────── */}
          {hasGenerated && !isGenerating && !error && pageCount > 0 && (
            <div style={{
              border: "1px solid rgba(0,255,135,0.25)",
              borderRadius: "8px",
              background: "rgba(0,255,135,0.03)",
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(0,255,135,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", letterSpacing: "3px", color: "#00ff87", textTransform: "uppercase", fontWeight: 700 }}>// Deploy to Vercel</span>
                  {deployStatus === "live" && (
                    <span style={{ fontSize: "9px", letterSpacing: "2px", background: "rgba(0,255,135,0.15)", color: "#00ff87", border: "1px solid rgba(0,255,135,0.4)", borderRadius: "10px", padding: "2px 8px" }}>● LIVE</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#4a3a6a", letterSpacing: "1px" }}>{pageCount}/7 pages ready</span>
                  <button
                    onClick={() => setDeployHistoryOpen(true)}
                    style={{
                      padding: "4px 10px", background: "transparent",
                      border: "1px solid rgba(0,255,135,0.2)", color: "#4a7a5a",
                      borderRadius: "4px", fontSize: "9px", letterSpacing: "1.5px",
                      cursor: "pointer", textTransform: "uppercase",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    ▲ History
                    {deployHistory.length > 0 && (
                      <span style={{ background: "#00ff87", color: "#0a0a0f", borderRadius: "8px", padding: "0 5px", fontSize: "8px", fontWeight: 700 }}>
                        {deployHistory.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Idle / Error — config fields + deploy button */}
                {(deployStatus === "idle" || deployStatus === "error") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                    {/* Project name */}
                    <div>
                      <label style={{ display: "block", fontSize: "9px", letterSpacing: "2px", color: "#4a7a5a", textTransform: "uppercase", marginBottom: "5px" }}>
                        Project Name
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={deployProjectName}
                          onChange={(e) => setDeployProjectName(e.target.value)}
                          placeholder={autoProjectName}
                          style={{
                            width: "100%", padding: "8px 12px", boxSizing: "border-box",
                            background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,255,135,0.2)",
                            borderRadius: "4px", color: "#e8d4ff", fontSize: "12px",
                            fontFamily: "monospace", outline: "none",
                            caretColor: "#00ff87",
                          }}
                        />
                        <div style={{ marginTop: "4px", fontSize: "10px", color: "#4a6a5a", fontFamily: "monospace" }}>
                          ↗ <span style={{ color: "#00ff87" }}>{effectiveProjectName}</span>.vercel.app
                        </div>
                      </div>
                    </div>

                    {/* Custom domain */}
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", letterSpacing: "2px", color: "#4a7a5a", textTransform: "uppercase", marginBottom: "5px" }}>
                        Custom Domain
                        <span style={{ fontSize: "8px", background: "rgba(0,255,135,0.1)", color: "#00ff87", border: "1px solid rgba(0,255,135,0.2)", borderRadius: "8px", padding: "1px 6px", letterSpacing: "1px" }}>optional</span>
                      </label>
                      <input
                        type="text"
                        value={deployCustomDomain}
                        onChange={(e) => setDeployCustomDomain(e.target.value)}
                        placeholder="www.yoursite.com"
                        style={{
                          width: "100%", padding: "8px 12px", boxSizing: "border-box",
                          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,255,135,0.2)",
                          borderRadius: "4px", color: "#e8d4ff", fontSize: "12px",
                          fontFamily: "monospace", outline: "none",
                          caretColor: "#00ff87",
                        }}
                      />
                      <div style={{ marginTop: "4px", fontSize: "10px", color: "#4a3a6a", lineHeight: 1.4 }}>
                        Domain must already exist in your Vercel account with DNS configured.
                      </div>
                    </div>

                    {/* Deploy button */}
                    <button
                      onClick={handleDeploy}
                      style={{
                        padding: "12px 20px",
                        background: "linear-gradient(135deg, rgba(0,255,135,0.12), rgba(0,255,135,0.06))",
                        border: "1px solid rgba(0,255,135,0.5)",
                        color: "#00ff87", borderRadius: "4px", fontSize: "12px",
                        letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase",
                        fontWeight: 700, transition: "all 0.2s ease",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      }}
                    >
                      ▲ Deploy {pageCount} Pages to Vercel
                    </button>
                  </div>
                )}

                {/* Error message */}
                {deployStatus === "error" && deployError && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 14px", background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "4px" }}>
                    <span style={{ color: "#ff4444", fontSize: "13px", flexShrink: 0 }}>⚠</span>
                    <span style={{ color: "#cc8888", fontSize: "11px", lineHeight: 1.5 }}>{deployError}</span>
                    <button onClick={() => { setDeployStatus("idle"); setDeployError(null); }} style={{ marginLeft: "auto", flexShrink: 0, background: "transparent", border: "none", color: "#ff6666", cursor: "pointer", fontSize: "11px" }}>✕</button>
                  </div>
                )}

                {/* Deploying — animated status */}
                {deployStatus === "deploying" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Spinner + current step */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ position: "relative", width: "36px", height: "36px", flexShrink: 0 }}>
                        <div style={{ position: "absolute", inset: 0, border: "2px solid rgba(0,255,135,0.15)", borderTop: "2px solid #00ff87", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
                        <div style={{ position: "absolute", inset: "6px", border: "1px solid rgba(0,255,135,0.1)", borderBottom: "1px solid rgba(0,255,135,0.5)", borderRadius: "50%", animation: "spin 1.5s linear infinite reverse" }} />
                      </div>
                      <div>
                        <div style={{ color: "#00ff87", fontSize: "13px", fontWeight: 700, letterSpacing: "1px" }}>
                          {DEPLOY_STEPS[deployStep]}
                        </div>
                        <div style={{ color: "#4a3a6a", fontSize: "10px", letterSpacing: "1px", marginTop: "3px" }}>
                          Deploying {pageCount} pages · Vercel Edge Network
                        </div>
                      </div>
                    </div>
                    {/* Step progress dots */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {DEPLOY_STEPS.map((step, i) => (
                        <div key={step} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{
                            width: i <= deployStep ? "8px" : "6px",
                            height: i <= deployStep ? "8px" : "6px",
                            borderRadius: "50%",
                            background: i < deployStep ? "#00ff87" : i === deployStep ? "#00ff87" : "rgba(0,255,135,0.2)",
                            boxShadow: i === deployStep ? "0 0 8px rgba(0,255,135,0.8)" : "none",
                            transition: "all 0.4s ease",
                          }} />
                          {i < DEPLOY_STEPS.length - 1 && (
                            <div style={{ width: "20px", height: "1px", background: i < deployStep ? "rgba(0,255,135,0.5)" : "rgba(0,255,135,0.1)" }} />
                          )}
                        </div>
                      ))}
                      <span style={{ fontSize: "9px", color: "#4a3a6a", marginLeft: "4px", letterSpacing: "1px" }}>
                        {DEPLOY_STEPS[deployStep].replace("...", "")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Live — success panel */}
                {deployStatus === "live" && deployUrl && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Success banner */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(0,255,135,0.08)", border: "1px solid rgba(0,255,135,0.35)", borderRadius: "4px" }}>
                      <span style={{ fontSize: "18px" }}>✓</span>
                      <div>
                        <div style={{ color: "#00ff87", fontSize: "12px", fontWeight: 700, letterSpacing: "2px" }}>LIVE ONLINE</div>
                        <div style={{ color: "#4a7a5a", fontSize: "10px", letterSpacing: "1px", marginTop: "2px" }}>All {pageCount} pages deployed to Vercel Edge Network</div>
                      </div>
                    </div>

                    {/* Custom domain URL (primary, if set) */}
                    {deployLiveCustomDomain && (
                      <div>
                        <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#4a7a5a", textTransform: "uppercase", marginBottom: "4px" }}>Custom Domain</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.35)", borderRadius: "4px", fontFamily: "monospace", fontSize: "12px", color: "#00ff87", wordBreak: "break-all" }}>
                          <span style={{ flexShrink: 0 }}>🌐</span>
                          <span style={{ flex: 1 }}>{deployLiveCustomDomain}</span>
                        </div>
                      </div>
                    )}

                    {/* Alias warning */}
                    {deployAliasWarning && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 12px", background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.3)", borderRadius: "4px" }}>
                        <span style={{ color: "#ffc800", fontSize: "12px", flexShrink: 0 }}>⚠</span>
                        <div>
                          <div style={{ color: "#cc9900", fontSize: "10px", letterSpacing: "1px", fontWeight: 700, marginBottom: "2px" }}>CUSTOM DOMAIN NOT ASSIGNED</div>
                          <div style={{ color: "#997700", fontSize: "10px", lineHeight: 1.5 }}>{deployAliasWarning}</div>
                          <div style={{ color: "#6a5a00", fontSize: "10px", marginTop: "4px" }}>Add the domain in your Vercel dashboard and redeploy.</div>
                        </div>
                      </div>
                    )}

                    {/* Vercel.app URL */}
                    <div>
                      <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#4a3a6a", textTransform: "uppercase", marginBottom: "4px" }}>
                        {deployLiveCustomDomain ? "Vercel URL" : "Live URL"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,135,0.2)", borderRadius: "4px", fontFamily: "monospace", fontSize: "12px", color: deployLiveCustomDomain ? "#4a7a5a" : "#00ff87", wordBreak: "break-all" }}>
                        <span style={{ flexShrink: 0, color: "#4a3a6a" }}>↗</span>
                        <span style={{ flex: 1 }}>{deployUrl}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <a
                        href={deployLiveCustomDomain ?? deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 2, padding: "10px 16px", minWidth: "120px",
                          background: "linear-gradient(135deg, rgba(0,255,135,0.18), rgba(0,255,135,0.08))",
                          border: "1px solid rgba(0,255,135,0.5)", color: "#00ff87",
                          borderRadius: "4px", fontSize: "11px", letterSpacing: "2px",
                          textDecoration: "none", textTransform: "uppercase", fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        }}
                      >
                        ↗ Open Site
                      </a>
                      <button
                        onClick={() => { void navigator.clipboard.writeText(deployLiveCustomDomain ?? deployUrl); }}
                        style={{
                          flex: 1, padding: "10px 16px", minWidth: "100px",
                          background: "transparent", border: "1px solid rgba(0,255,135,0.3)",
                          color: "#4a9a6a", borderRadius: "4px", fontSize: "11px",
                          letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase",
                        }}
                      >
                        ⎘ Copy URL
                      </button>
                      <button
                        onClick={() => {
                          setDeployStatus("idle");
                          setDeployUrl(null);
                          setDeployLiveCustomDomain(null);
                          setDeployAliasWarning(null);
                        }}
                        style={{
                          padding: "10px 14px",
                          background: "transparent", border: "1px solid rgba(0,255,135,0.15)",
                          color: "#4a6a5a", borderRadius: "4px", fontSize: "10px",
                          letterSpacing: "1px", cursor: "pointer", textTransform: "uppercase",
                        }}
                      >
                        ↻ Redeploy
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* SEO Panel */}
          {hasGenerated && !isGenerating && !error && seoData && (
            <SeoPanel seo={seoData} pages={pages} />
          )}

          {isGenerating && (
            <div className="seo-panel seo-skeleton">
              <div className="seo-panel-header">
                <span className="seo-panel-label">// SEO ANALYSIS</span>
                <div className="seo-skeleton-badge" />
              </div>
              {[1,2,3].map((i) => <div key={i} className="seo-skeleton-row" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          )}
        </div>
      </section>

      {/* History Panel */}
      <HistoryPanel
        history={history}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onView={loadFromHistory}
        onDuplicate={duplicateEntry}
        onDelete={deleteEntry}
      />

      {/* Deploy History Panel */}
      <DeployHistoryPanel
        deployHistory={deployHistory}
        isOpen={deployHistoryOpen}
        onClose={() => setDeployHistoryOpen(false)}
        onDelete={deleteDeployEntry}
        onClear={clearDeployHistory}
        onRedeploy={handleRedeployFromHistory}
        availableGenerationIds={history.map((e) => e.id)}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          section:last-of-type { grid-template-columns: 380px 1fr !important; }
        }
      `}</style>
    </main>
  );
}
