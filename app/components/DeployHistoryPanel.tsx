"use client";

import { useEffect, useRef } from "react";
import type { DeployEntry } from "../hooks/useDeployHistory";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  deployHistory:          DeployEntry[];
  isOpen:                 boolean;
  onClose:                () => void;
  onDelete:               (id: string) => void;
  onClear:                () => void;
  onRedeploy:             (entry: DeployEntry) => void;
  availableGenerationIds: string[];
}

export function DeployHistoryPanel({
  deployHistory,
  isOpen,
  onClose,
  onDelete,
  onClear,
  onRedeploy,
  availableGenerationIds,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(3px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
        width: "min(440px, 100vw)",
        background: "#0a0a0f",
        border: "1px solid rgba(0,255,135,0.18)",
        borderRight: "none",
        display: "flex", flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: isOpen ? "-4px 0 40px rgba(0,255,135,0.08)" : "none",
      }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(0,255,135,0.12)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#00ff87", textTransform: "uppercase", fontWeight: 700 }}>
              ▲ Deploy History
            </div>
            <div style={{ fontSize: "10px", color: "#4a3a6a", marginTop: "3px", letterSpacing: "1px" }}>
              {deployHistory.length} deployment{deployHistory.length !== 1 ? "s" : ""} · {availableGenerationIds.length} sets of pages available
            </div>
          </div>
          {deployHistory.length > 0 && (
            <button
              onClick={onClear}
              title="Clear all deployments"
              style={{ padding: "5px 10px", background: "transparent", border: "1px solid rgba(255,50,50,0.25)", color: "#6a3a3a", borderRadius: "4px", fontSize: "9px", letterSpacing: "1.5px", cursor: "pointer", textTransform: "uppercase" }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            style={{ padding: "6px 10px", background: "transparent", border: "1px solid rgba(0,255,135,0.2)", color: "#4a7a5a", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Redeploy explanation */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(0,255,135,0.06)", background: "rgba(0,255,135,0.02)", fontSize: "10px", color: "#4a5a4a", lineHeight: 1.5 }}>
          ↻ Redeploy restores the original pages and immediately pushes a fresh deployment to Vercel.
          Pages must still be in your generation history (last 5 sites).
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {deployHistory.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px", color: "#4a3a6a" }}>
              <div style={{ fontSize: "32px", opacity: 0.25 }}>▲</div>
              <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" }}>No deployments yet</div>
              <div style={{ fontSize: "10px", color: "#3a2a5a" }}>Generate a site and deploy it to Vercel</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {deployHistory.map((entry) => (
                <DeployCard
                  key={entry.id}
                  entry={entry}
                  canRedeploy={!!entry.generationId && availableGenerationIds.includes(entry.generationId)}
                  hasGenerationId={!!entry.generationId}
                  onDelete={onDelete}
                  onRedeploy={onRedeploy}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,255,135,0.08)", fontSize: "10px", color: "#3a2a5a", letterSpacing: "1px", textAlign: "center" }}>
          Stores last 20 deployments · localStorage
        </div>
      </div>
    </>
  );
}

/* ─── Single deploy card ────────────────────────────────────────────── */

interface CardProps {
  entry:          DeployEntry;
  canRedeploy:    boolean;
  hasGenerationId:boolean;
  onDelete:       (id: string) => void;
  onRedeploy:     (entry: DeployEntry) => void;
}

function DeployCard({ entry, canRedeploy, hasGenerationId, onDelete, onRedeploy }: CardProps) {
  const primaryUrl = entry.customDomain ?? entry.url;
  const hasCustom  = !!entry.customDomain;

  const redeployTitle = canRedeploy
    ? `Redeploy "${entry.projectName}" — restores pages & pushes fresh Vercel deployment`
    : hasGenerationId
      ? "Original pages were removed from generation history. Regenerate the site first."
      : "No page data linked (deployed before this feature was added).";

  return (
    <div style={{
      border: "1px solid rgba(0,255,135,0.15)",
      borderRadius: "6px",
      background: "rgba(0,255,135,0.025)",
      overflow: "hidden",
    }}>
      {/* Top row */}
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {/* Icon */}
        <div style={{
          width: "32px", height: "32px", flexShrink: 0,
          background: "rgba(0,255,135,0.08)",
          border: "1px solid rgba(0,255,135,0.2)",
          borderRadius: "4px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px",
        }}>
          ▲
        </div>

        {/* Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#e8d4ff", fontWeight: 700, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
              {entry.projectName}
            </span>
            {hasCustom && (
              <span style={{ fontSize: "8px", background: "rgba(0,255,135,0.12)", color: "#00ff87", border: "1px solid rgba(0,255,135,0.3)", borderRadius: "8px", padding: "1px 6px", letterSpacing: "1px", flexShrink: 0 }}>
                CUSTOM DOMAIN
              </span>
            )}
          </div>
          <div style={{ fontSize: "10px", color: "#4a7a5a", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {primaryUrl.replace("https://", "")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "9px", color: "#4a3a6a" }}>{timeAgo(entry.timestamp)}</span>
            <span style={{ fontSize: "9px", color: "#3a2a5a" }}>·</span>
            <span style={{ fontSize: "9px", color: "#4a3a6a" }}>{entry.pageCount} pages</span>
            <span style={{ fontSize: "9px", color: "#3a2a5a" }}>·</span>
            <span style={{ fontSize: "9px", color: "#4a3a6a" }}>{entry.template}</span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(entry.id)}
          title="Remove from history"
          style={{ background: "transparent", border: "none", color: "#4a3a5a", cursor: "pointer", fontSize: "12px", padding: "2px 4px", flexShrink: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {/* Prompt preview */}
      {entry.prompt && (
        <div style={{ padding: "0 12px 8px", fontSize: "10px", color: "#4a3a6a", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {entry.prompt}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: "flex", borderTop: "1px solid rgba(0,255,135,0.08)" }}>
        {/* Redeploy */}
        <button
          onClick={() => canRedeploy && onRedeploy(entry)}
          title={redeployTitle}
          style={{
            flex: 1, padding: "8px 10px",
            background: canRedeploy ? "rgba(0,255,135,0.06)" : "transparent",
            border: "none",
            borderRight: "1px solid rgba(0,255,135,0.08)",
            color: canRedeploy ? "#00ff87" : "#3a4a3a",
            fontSize: "10px", letterSpacing: "1.5px",
            cursor: canRedeploy ? "pointer" : "not-allowed",
            textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            transition: "background 0.15s ease",
          }}
        >
          {canRedeploy ? (
            <>
              <span style={{ fontSize: "11px" }}>↻</span> Redeploy
            </>
          ) : (
            <span title={redeployTitle} style={{ cursor: "help" }}>↻ Redeploy</span>
          )}
        </button>

        {/* Open */}
        <a
          href={primaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: "8px 10px",
            background: "transparent",
            borderRight: "1px solid rgba(0,255,135,0.08)",
            color: "#00ff87", fontSize: "10px", letterSpacing: "1.5px",
            textDecoration: "none", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
          }}
        >
          ↗ Open
        </a>

        {/* Copy */}
        <button
          onClick={() => { void navigator.clipboard.writeText(primaryUrl); }}
          style={{
            flex: 1, padding: "8px 10px",
            background: "transparent", border: "none",
            borderRight: entry.url !== primaryUrl ? "1px solid rgba(0,255,135,0.08)" : "none",
            color: "#4a7a5a", fontSize: "10px", letterSpacing: "1.5px",
            cursor: "pointer", textTransform: "uppercase",
          }}
        >
          ⎘ Copy
        </button>

        {/* Copy .app URL (only when custom domain is set) */}
        {entry.url !== primaryUrl && (
          <button
            onClick={() => { void navigator.clipboard.writeText(entry.url); }}
            title="Copy vercel.app URL"
            style={{
              flex: 1, padding: "8px 10px",
              background: "transparent", border: "none",
              color: "#3a5a4a", fontSize: "9px", letterSpacing: "1px",
              cursor: "pointer", textTransform: "uppercase",
            }}
          >
            ▲ .app
          </button>
        )}
      </div>
    </div>
  );
}
