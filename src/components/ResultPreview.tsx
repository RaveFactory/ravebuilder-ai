"use client";

import { useState } from "react";

interface ResultPreviewProps {
  code: string;
  onClose: () => void;
}

export default function ResultPreview({ code, onClose }: ResultPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-up space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold neon-text-purple">
          Generated Code
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="rounded-lg bg-cyber-surface px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-neon-purple/20 hover:text-neon-purple"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-cyber-surface px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400"
          >
            Close
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl neon-border">
        <iframe
          srcDoc={code}
          title="Preview"
          className="h-96 w-full bg-white"
          sandbox="allow-scripts"
        />
      </div>

      <details className="group">
        <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors">
          View Source Code
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-cyber-darker p-4 text-xs text-gray-400 neon-border">
          <code>{code}</code>
        </pre>
      </details>
    </div>
  );
}
