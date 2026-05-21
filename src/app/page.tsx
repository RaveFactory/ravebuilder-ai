"use client";

import { useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  accent: "purple" | "pink" | "blue" | "green";
  icon: string;
}

const templates: Template[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon-lit dystopian cityscape with glitch effects and dark synthwave vibes",
    prompt:
      "Create a cyberpunk-themed website with neon purple and pink accents, glitch text effects, dark backgrounds, futuristic typography, and animated neon borders. Include a hero section with a glitch effect title, a features grid with neon hover cards, and a footer with scanline overlay.",
    accent: "purple",
    icon: "🌆",
  },
  {
    id: "hardtek",
    name: "Hardtek",
    description: "Industrial techno aesthetic with raw energy and distorted visuals",
    prompt:
      "Create a hardtek/industrial-techno themed website with aggressive red and orange accents, distorted grid patterns, heavy bold typography, industrial textures, and pulsing animations. Include a hero with a massive distorted title, a tracklist section with waveform-style dividers, and a dark gritty footer.",
    accent: "pink",
    icon: "🔊",
  },
  {
    id: "jungle",
    name: "Jungle",
    description: "Deep bass and organic rave aesthetics with lush green tones",
    prompt:
      "Create a jungle/DnB themed website with lush green and teal accents, organic flowing shapes, bass-wave animations, tropical patterns, and deep dark backgrounds. Include a hero section with flowing wave animations, a music section with vinyl-style cards, and a footer with leaf-like organic borders.",
    accent: "green",
    icon: "🌿",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean dark aesthetic with subtle elegance and refined simplicity",
    prompt:
      "Create a minimal dark-themed website with clean white and gray accents on dark backgrounds, subtle micro-animations, refined typography with lots of whitespace, thin borders, and smooth transitions. Include a hero with elegant typography, a features section with clean icon cards, and a minimal footer.",
    accent: "blue",
    icon: "◻",
  },
];

const accentStyles = {
  purple: {
    border: "border-neon-purple/40",
    selectedBorder: "border-neon-purple shadow-neon-purple ring-1 ring-neon-purple/50",
    bg: "bg-neon-purple/10",
    text: "text-neon-purple",
    dot: "bg-neon-purple",
  },
  pink: {
    border: "border-neon-pink/40",
    selectedBorder: "border-neon-pink shadow-neon-pink ring-1 ring-neon-pink/50",
    bg: "bg-neon-pink/10",
    text: "text-neon-pink",
    dot: "bg-neon-pink",
  },
  green: {
    border: "border-neon-green/40",
    selectedBorder: "border-neon-green shadow-neon-green ring-1 ring-neon-green/50",
    bg: "bg-neon-green/10",
    text: "text-neon-green",
    dot: "bg-neon-green",
  },
  blue: {
    border: "border-neon-blue/40",
    selectedBorder: "border-neon-blue shadow-neon-blue ring-1 ring-neon-blue/50",
    bg: "bg-neon-blue/10",
    text: "text-neon-blue",
    dot: "bg-neon-blue",
  },
};

export default function DashboardPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="neon-text-purple">RaveBuilder</span>{" "}
          <span className="text-gray-400 font-light">AI</span>
        </h1>
        <p className="text-sm text-gray-500">
          Select a template, describe your website, and generate it.
        </p>
      </header>

      {/* Templates */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Templates
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const isSelected = selectedTemplate.id === template.id;
            const accent = accentStyles[template.accent];
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`
                  relative rounded-xl p-3.5 text-left transition-all duration-300
                  bg-cyber-surface border
                  ${isSelected ? accent.selectedBorder : "border-cyber-border hover:border-gray-700"}
                `}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.bg} text-lg transition-transform duration-300 hover:scale-110`}
                  >
                    {template.icon}
                  </div>
                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        isSelected ? accent.text : "text-gray-200"
                      }`}
                    >
                      {template.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className={`absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full ${accent.dot} animate-pulse-neon`} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Prompt Input */}
      <section className="space-y-2">
        <label htmlFor="prompt" className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Describe the website you want to generate..."
          className="cyber-input w-full resize-none px-4 py-3 text-sm placeholder:text-gray-600"
        />
        <div className="text-right">
          <span className="text-[11px] tabular-nums text-gray-600">
            {prompt.length}/2000
          </span>
        </div>
      </section>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className={`
          cyber-btn w-full py-3.5 text-sm font-semibold tracking-wide uppercase
          flex items-center justify-center gap-2
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
          ${loading ? "animate-pulse-neon" : ""}
        `}
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span className="text-lg">⚡</span>
            <span>Generate Website</span>
          </>
        )}
      </button>
    </div>
  );
}
