"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mistral_api_key");
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem("mistral_api_key", apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem("mistral_api_key");
    setApiKey("");
    setSaved(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="neon-text-green">Settings</span>
        </h1>
        <p className="text-sm text-gray-500">
          Configure your API keys and preferences.
        </p>
      </section>

      <section className="cyber-card space-y-6 p-6">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-gray-200">
            Mistral AI API Key
          </h2>
          <p className="text-xs text-gray-500">
            Your API key is stored locally in your browser and never sent to our
            servers. It is only used to make direct requests to the Mistral AI
            API.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Mistral API key..."
              className="cyber-input w-full px-4 py-3 pr-12 text-sm font-mono placeholder:text-gray-600"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              type="button"
            >
              {showKey ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="cyber-btn px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Key
            </button>

            {apiKey && (
              <button
                onClick={handleClear}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
              >
                Clear
              </button>
            )}
          </div>

          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-neon-green/30 bg-neon-green/10 px-4 py-2.5 text-sm text-neon-green animate-slide-up">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              API key saved successfully
            </div>
          )}
        </div>

        <div className="border-t border-cyber-border pt-4">
          <p className="text-xs text-gray-600">
            Get your Mistral API key from{" "}
            <a
              href="https://console.mistral.ai/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-purple hover:underline"
            >
              console.mistral.ai/api-keys
            </a>
          </p>
        </div>
      </section>

      <section className="cyber-card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-gray-200">About</h2>
        <div className="space-y-2 text-xs text-gray-500">
          <p>
            <span className="neon-text-purple font-semibold">RaveBuilder AI</span>{" "}
            generates responsive, cyberpunk-themed websites using Mistral AI.
          </p>
          <p>
            Select a template, describe your vision, and get a complete
            HTML + Tailwind CSS website in seconds.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>Version 1.0.0</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>Next.js 14</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>Tailwind CSS</span>
        </div>
      </section>
    </div>
  );
}
