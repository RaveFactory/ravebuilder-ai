"use client";

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  accent: "purple" | "pink" | "blue" | "green";
  icon: string;
}

const accentMap = {
  purple: {
    border: "border-neon-purple/40",
    bg: "bg-neon-purple/10",
    text: "text-neon-purple",
    shadow: "shadow-neon-purple",
    neonBorder: "neon-border",
    glow: "group-hover:shadow-neon-purple",
    ring: "ring-neon-purple/50",
  },
  pink: {
    border: "border-neon-pink/40",
    bg: "bg-neon-pink/10",
    text: "text-neon-pink",
    shadow: "shadow-neon-pink",
    neonBorder: "neon-border-pink",
    glow: "group-hover:shadow-neon-pink",
    ring: "ring-neon-pink/50",
  },
  blue: {
    border: "border-neon-blue/40",
    bg: "bg-neon-blue/10",
    text: "text-neon-blue",
    shadow: "shadow-neon-blue",
    neonBorder: "neon-border-blue",
    glow: "group-hover:shadow-neon-blue",
    ring: "ring-neon-blue/50",
  },
  green: {
    border: "border-neon-green/40",
    bg: "bg-neon-green/10",
    text: "text-neon-green",
    shadow: "shadow-neon-green",
    neonBorder: "neon-border-green",
    glow: "group-hover:shadow-neon-green",
    ring: "ring-neon-green/50",
  },
};

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (template: Template) => void;
}

export default function TemplateCard({
  template,
  isSelected,
  onSelect,
}: TemplateCardProps) {
  const accent = accentMap[template.accent];

  return (
    <button
      onClick={() => onSelect(template)}
      className={`
        group relative w-full rounded-xl p-4 text-left transition-all duration-300
        cyber-card
        ${isSelected ? `${accent.border} ${accent.shadow} ring-2 ${accent.ring}` : "border-cyber-border"}
      `}
    >
      {isSelected && (
        <div
          className={`absolute -top-px -right-px -bottom-px -left-px rounded-xl ${accent.neonBorder} pointer-events-none`}
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.bg} text-xl transition-transform duration-300 group-hover:scale-110`}
        >
          {template.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold transition-colors duration-300 ${
              isSelected ? accent.text : "text-gray-200"
            }`}
          >
            {template.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {template.description}
          </p>
        </div>

        {isSelected && (
          <div className={`mt-1 h-2 w-2 rounded-full ${accent.bg} ${accent.text} animate-pulse-neon`}>
            <div className={`h-2 w-2 rounded-full ${accent.bg}`} />
          </div>
        )}
      </div>
    </button>
  );
}

export const templates: Template[] = [
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
