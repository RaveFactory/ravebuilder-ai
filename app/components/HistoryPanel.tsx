"use client";

import { useState, useEffect, useRef } from "react";
import { strToU8, zip } from "fflate";
import type { HistoryEntry, SeoData, Template } from "../hooks/useHistory";
import { getPrimaryHtml } from "../hooks/useHistory";

const EMPTY_SEO: SeoData = { title: "", description: "", keywords: "" };

const TEMPLATE_META: Record<Template, { emoji: string; accent: string; label: string }> = {
  cyberpunk: { emoji: "⚡", accent: "#b026ff", label: "Cyberpunk" },
  hardtek:   { emoji: "🔊", accent: "#ff3a00", label: "Hardtek"  },
  jungle:    { emoji: "🌿", accent: "#00ff87", label: "Jungle"   },
  minimal:   { emoji: "◻",  accent: "#e0e0e0", label: "Minimal"  },
};

const PAGE_FILENAMES: Record<string, string> = {
  home:    "index.html",
  event:   "event.html",
  tickets: "tickets.html",
  gallery: "gallery.html",
  faq:     "faq.html",
  blog:    "blog.html",
  contact: "contact.html",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function exportZip(entry: HistoryEntry) {
  const slug = `ravebuilder-${entry.template}-${entry.id.slice(0, 6)}`;
  const files: Record<string, Uint8Array> = {};

  const pages = entry.pages ?? {};
  for (const [key, html] of Object.entries(pages)) {
    if (!html) continue;
    const filename = PAGE_FILENAMES[key] ?? `${key}.html`;
    files[`${slug}/${filename}`] = strToU8(html);
  }

  if (Object.keys(files).length === 0) return;

  zip(files, (err, data) => {
    if (err) { console.error("ZIP error", err); return; }
    const blob = new Blob([data], { type: "application/zip" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
      href:     url,
      download: `${slug}.zip`,
    });
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ─── Compare Modal ─────────────────────────────────────────────────── */

interface CompareModalProps {
  entries: [HistoryEntry, HistoryEntry];
  onClose: () => void;
}

function CompareModal({ entries, onClose }: CompareModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,5,10,0.97)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(176,38,255,0.2)", background: "rgba(10,10,15,0.98)", flexShrink: 0 }}>
        <span style={{ color: "#b026ff", fontSize: "11px", letterSpacing: "3px", fontWeight: 700 }}>◈ COMPARE VIEW — HOME PAGE</span>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(176,38,255,0.3)", color: "#8b7aab", borderRadius: "4px", padding: "6px 14px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer" }}>
          ✕ CLOSE
        </button>
      </div>
      <div style={{ flex: 1, display: "grid", overflow: "hidden", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "rgba(176,38,255,0.15)" }} className="compare-grid">
        {entries.map((entry, i) => {
          const meta = TEMPLATE_META[entry.template];
          const pageCount = Object.values(entry.pages ?? {}).filter(Boolean).length;
          return (
            <div key={entry.id} style={{ display: "flex", flexDirection: "column", background: "#0a0a0f", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(176,38,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <span style={{ fontSize: "12px", color: meta.accent, letterSpacing: "1px", fontWeight: 700 }}>
                  {meta.emoji} {meta.label} — #{i + 1}
                </span>
                <span style={{ fontSize: "10px", color: "#4a3a6a" }}>{pageCount}p · {timeAgo(entry.timestamp)}</span>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <iframe srcDoc={getPrimaryHtml(entry)} style={{ width: "100%", height: "100%", border: "none", display: "block" }} sandbox="allow-scripts" title={`Compare ${i + 1}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── History Card ───────────────────────────────────────────────────── */

interface CardProps {
  entry: HistoryEntry;
  compareMode: boolean;
  compareSelected: boolean;
  onView: () => void;
  onSelectCompare: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function HistoryCard({ entry, compareMode, compareSelected, onView, onSelectCompare, onDuplicate, onDelete }: CardProps) {
  const meta = TEMPLATE_META[entry.template];
  const [hover, setHover] = useState(false);
  const pageCount = Object.values(entry.pages ?? {}).filter(Boolean).length;
  const primaryHtml = getPrimaryHtml(entry);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: compareSelected ? "rgba(176,38,255,0.12)" : hover ? "rgba(176,38,255,0.06)" : "#12121c",
        border: `1px solid ${compareSelected ? meta.accent : hover ? "rgba(176,38,255,0.4)" : "rgba(42,26,74,0.8)"}`,
        borderRadius: "6px", overflow: "hidden", transition: "all 0.18s ease", cursor: "pointer",
        boxShadow: compareSelected ? `0 0 12px rgba(176,38,255,0.3)` : "none", flexShrink: 0,
      }}
    >
      {/* Tiny iframe preview */}
      <div style={{ height: "100px", overflow: "hidden", position: "relative", pointerEvents: "none" }}>
        <iframe srcDoc={primaryHtml} style={{ width: "300%", height: "300%", border: "none", transform: "scale(0.333)", transformOrigin: "0 0" }} sandbox="allow-scripts" title="preview" />
        <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(10,10,15,0.85)", border: `1px solid ${meta.accent}`, borderRadius: "3px", padding: "2px 8px", fontSize: "10px", color: meta.accent, letterSpacing: "1px", fontWeight: 700 }}>
          {meta.emoji} {meta.label}
        </div>
        <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "9px", color: "#4a3a6a", background: "rgba(10,10,15,0.8)", padding: "2px 6px", borderRadius: "2px" }}>
          {pageCount}p · {timeAgo(entry.timestamp)}
        </div>
      </div>

      {/* Prompt text */}
      <div style={{ padding: "10px 12px 8px" }}>
        <p style={{ fontSize: "11px", color: "#8b7aab", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {entry.prompt}
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "4px", padding: "0 8px 8px", flexWrap: "wrap" }}>
        <ActionBtn label="VIEW" onClick={onView} accent="#b026ff" />
        <ActionBtn label={compareSelected ? "✓ PICKED" : "COMPARE"} onClick={onSelectCompare} accent={compareMode ? meta.accent : "#8b7aab"} highlight={compareSelected} />
        <ActionBtn label="DUPE" onClick={onDuplicate} accent="#8b7aab" />
        <ActionBtn label="ZIP" onClick={() => exportZip(entry)} accent="#26f0ff" />
        <ActionBtn label="✕" onClick={onDelete} accent="#ff4444" />
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, accent, highlight }: { label: string; onClick: () => void; accent: string; highlight?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: highlight || hover ? `${accent}22` : "transparent", border: `1px solid ${hover || highlight ? accent : "rgba(42,26,74,0.6)"}`, color: hover || highlight ? accent : "#5a4a7a", borderRadius: "3px", padding: "3px 7px", fontSize: "9px", letterSpacing: "1px", cursor: "pointer", fontWeight: 700, transition: "all 0.15s ease" }}
    >
      {label}
    </button>
  );
}

/* ─── Main HistoryPanel ──────────────────────────────────────────────── */

export interface HistoryPanelProps {
  history: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onView: (entry: HistoryEntry) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ history, isOpen, onClose, onView, onDuplicate, onDelete }: HistoryPanelProps) {
  const [compareIds, setCompareIds]       = useState<string[]>([]);
  const [compareEntries, setCompareEntries] = useState<[HistoryEntry, HistoryEntry] | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSelectCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const next = [...prev, id].slice(-2);
      if (next.length === 2) {
        const a = history.find((e) => e.id === next[0]);
        const b = history.find((e) => e.id === next[1]);
        if (a && b) setCompareEntries([a, b]);
        return [];
      }
      return next;
    });
  };

  const compareMode = compareIds.length > 0;
  const isEmpty = history.length === 0;

  return (
    <>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} className="history-backdrop" />
      )}

      <div ref={drawerRef} className={`history-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(176,38,255,0.2)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#b026ff", fontSize: "11px", letterSpacing: "3px", fontWeight: 700 }}>// HISTORY</span>
            {history.length > 0 && (
              <span style={{ background: "rgba(176,38,255,0.15)", border: "1px solid rgba(176,38,255,0.3)", color: "#b026ff", borderRadius: "10px", padding: "1px 8px", fontSize: "10px", fontWeight: 700 }}>
                {history.length}/5
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {compareMode && <span style={{ fontSize: "10px", color: "#8b7aab", letterSpacing: "1px" }}>Pick one more to compare</span>}
            <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(176,38,255,0.25)", color: "#8b7aab", borderRadius: "4px", padding: "5px 12px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer" }}>✕</button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {isEmpty ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#4a3a6a", textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "32px", opacity: 0.3 }}>◻</div>
              <div style={{ fontSize: "11px", letterSpacing: "2px" }}>NO GENERATIONS YET</div>
              <div style={{ fontSize: "10px", color: "#3a2a5a" }}>Generate your first site to see history</div>
            </div>
          ) : (
            history.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                compareMode={compareMode}
                compareSelected={compareIds.includes(entry.id)}
                onView={() => { onView(entry); onClose(); }}
                onSelectCompare={() => handleSelectCompare(entry.id)}
                onDuplicate={() => onDuplicate(entry.id)}
                onDelete={() => onDelete(entry.id)}
              />
            ))
          )}
        </div>

        {!isEmpty && (
          <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(176,38,255,0.1)", fontSize: "9px", color: "#3a2a5a", letterSpacing: "1px", textAlign: "center" }}>
            {compareMode ? "SELECT A SECOND SITE TO OPEN COMPARE VIEW" : "CLICK COMPARE ON TWO SITES TO COMPARE THEM SIDE BY SIDE"}
          </div>
        )}
      </div>

      {compareEntries && (
        <CompareModal entries={compareEntries} onClose={() => setCompareEntries(null)} />
      )}
    </>
  );
}
