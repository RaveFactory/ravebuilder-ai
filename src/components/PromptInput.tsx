"use client";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PromptInput({
  value,
  onChange,
  disabled,
}: PromptInputProps) {
  const charCount = value.length;
  const maxChars = 2000;

  return (
    <div className="space-y-2">
      <label
        htmlFor="prompt"
        className="block text-sm font-medium text-gray-300"
      >
        Describe your website
      </label>

      <div className="relative">
        <textarea
          id="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={5}
          maxLength={maxChars}
          placeholder="Describe the website you want to generate... e.g., A cyberpunk portfolio with neon effects, glitch animations, and a dark synthwave aesthetic"
          className="cyber-input w-full resize-none px-4 py-3 text-sm placeholder:text-gray-600 disabled:opacity-50"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={`text-xs tabular-nums ${
              charCount > maxChars * 0.9
                ? "text-neon-pink"
                : "text-gray-600"
            }`}
          >
            {charCount}/{maxChars}
          </span>
        </div>
      </div>
    </div>
  );
}
