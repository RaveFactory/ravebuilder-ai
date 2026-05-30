"use client";
import { useState } from "react";
import { strToU8, zip as fflateZip } from "fflate";
type Pages = Record<string, string>;
type Template =
  | "cyberpunk"
  | "hardtek"
  | "jungle"
  | "minimal";
interface SeoData {
  title: string;
  description: string;
  keywords: string;
}
interface TemplateCard {
  id: Template;
  name: string;
  emoji: string;
  description: string;
  accent: string;
}
const TEMPLATES: TemplateCard[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "⚡",
    description: "Neon futuristic energy",
    accent: "#b026ff",
  },
  {
    id: "hardtek",
    name: "Hardtek",
    emoji: "🔊",
    description: "Industrial rave atmosphere",
    accent: "#ff3a00",
  },
  {
    id: "jungle",
    name: "Jungle",
    emoji: "🌿",
    description: "Organic drum & bass vibes",
    accent: "#00ff87",
  },
  {
    id: "minimal",
    name: "Minimal",
    emoji: "◻",
    description: "Clean minimalist aesthetic",
    accent: "#e0e0e0",
  },
];
const PAGE_TABS = [
  { id: "home", label: "HOME" },
  { id: "event", label: "EVENT" },
  { id: "tickets", label: "TICKETS" },
  { id: "gallery", label: "GALLERY" },
  { id: "faq", label: "FAQ" },
  { id: "blog", label: "BLOG" },
  { id: "contact", label: "CONTACT" },
];
function exportAllZip(
  pages: Pages,
  template: string
) {
  const files: Record<string, Uint8Array> = {};
  Object.entries(pages).forEach(([key, html]) => {
    files[`${key}.html`] = strToU8(html);
  });
  fflateZip(files, (err, data) => {
    if (err) return;
    const url = URL.createObjectURL(
      new Blob([data], {
        type: "application/zip",
      })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `ravebuilder-${template}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template>("cyberpunk");
  const [pages, setPages] =
    useState<Pages>({});
  const [activePage, setActivePage] =
    useState("home");
  const [seoData, setSeoData] =
    useState<SeoData | null>(null);
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [hasGenerated, setHasGenerated] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const currentHtml =
    pages[activePage] ?? "";
  console.log("SEO", seoData);
  const pageCount =
    Object.values(pages).filter(Boolean).length;
  const canGenerate =
    prompt.trim().length > 0 && !isGenerating;
  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    setPages({});
    setSeoData(null);
    try {
      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            template: selectedTemplate,
          }),
        }
      );
      const data = (await response.json()) as {
        pages?: Record<string, string>;
        seo?: {
          title?: string;
          description?: string;
          keywords?: string;
        };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          data.error ??
            `Server error ${response.status}`
        );
      }
      const newPages = data.pages ?? {};
      const seo: SeoData = {
        title:
          data.seo?.title ?? "",
        description:
          data.seo?.description ?? "",
        keywords:
          data.seo?.keywords ?? "",
      };
      setPages(newPages);
      setSeoData(seo);
      setHasGenerated(true);
      setActivePage("home");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error"
      );
    } finally {
      setIsGenerating(false);
    }
  };
  const handleExportZip = () => {
    if (Object.keys(pages).length === 0) {
      return;
    }
    exportAllZip(
      pages,
      selectedTemplate
    );
  };
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "40px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          RaveBuilder AI
        </h1>
        <p
          style={{
            color: "#888",
            marginBottom: "40px",
          }}
        >
          Generate full rave websites with AI
        </p>
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontSize: "12px",
              letterSpacing: "2px",
              color: "#888",
            }}
          >
            TEMPLATE
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() =>
                  setSelectedTemplate(
                    template.id
                  )
                }
                style={{
                  padding: "16px",
                  background:
                    selectedTemplate ===
                    template.id
                      ? template.accent
                      : "#111",
                  border:
                    selectedTemplate ===
                    template.id
                      ? `2px solid ${template.accent}`
                      : "1px solid #333",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    marginBottom: "8px",
                  }}
                >
                  {template.emoji}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {template.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                  }}
                >
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          placeholder="Describe your rave website..."
          rows={6}
          style={{
            width: "100%",
            padding: "16px",
            background: "#111",
            border: "1px solid #333",
            color: "white",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: 1.6,
            marginBottom: "20px",
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            padding: "16px 28px",
            background: "#b026ff",
            border: "none",
            color: "white",
            borderRadius: "6px",
            cursor: canGenerate
              ? "pointer"
              : "not-allowed",
            opacity: canGenerate
              ? 1
              : 0.5,
            fontWeight: "bold",
            letterSpacing: "2px",
            marginBottom: "30px",
          }}
        >
          {isGenerating
            ? "GENERATING..."
            : "GENERATE WEBSITE"}
        </button>
        {error && (
          <div
            style={{
              padding: "16px",
              border: "1px solid red",
              background:
                "rgba(255,0,0,0.1)",
              color: "#ff6666",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}
        {hasGenerated && (
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {PAGE_TABS.map((tab) => {
                const hasContent =
                  !!pages[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActivePage(tab.id)
                    }
                    disabled={!hasContent}
                    style={{
                      padding:
                        "10px 16px",
                      background:
                        activePage ===
                        tab.id
                          ? "#b026ff"
                          : "#111",
                      border:
                        "1px solid #333",
                      color: "white",
                      borderRadius: "4px",
                      cursor:
                        hasContent
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        hasContent
                          ? 1
                          : 0.4,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={handleExportZip}
                style={{
                  padding:
                    "12px 20px",
                  background:
                    "#00ff87",
                  border: "none",
                  color: "black",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                EXPORT ZIP
              </button>
              <button
                onClick={handleGenerate}
                style={{
                  padding:
                    "12px 20px",
                  background:
                    "#222",
                  border:
                    "1px solid #444",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                REGENERATE
              </button>
            </div>
            {seoData && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  background: "#111",
                  border:
                    "1px solid #333",
                  borderRadius: "6px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "16px",
                  }}
                >
                  SEO DATA
                </h3>
                <p>
                  <strong>Title:</strong>{" "}
                  {seoData.title}
                </p>
                <p>
                  <strong>
                    Description:
                  </strong>{" "}
                  {seoData.description}
                </p>
                <p>
                  <strong>
                    Keywords:
                  </strong>{" "}
                  {seoData.keywords}
                </p>
              </div>
            )}
            {currentHtml && (
             <iframe
  srcDoc={currentHtml}
  title="preview"
  sandbox="allow-scripts"
  style={{
    width: "100%",
    maxWidth: "100%",
    height: "900px",
    border: "1px solid #333",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
  }}
/>
            )}
            <div
              style={{
                marginTop: "20px",
                color: "#666",
                fontSize: "12px",
              }}
            >
              {pageCount} pages generated
            </div>
          </>
        )}
      </div>
    </main>
  );
}
