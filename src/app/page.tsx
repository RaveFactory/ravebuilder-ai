"use client";

import { useState } from "react";
import TemplateCard, { templates, Template } from "@/components/TemplateCard";
import PromptInput from "@/components/PromptInput";
import GenerateButton from "@/components/GenerateButton";
import ResultPreview from "@/components/ResultPreview";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    templates[0]
  );
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    const apiKey = localStorage.getItem("mistral_api_key");
    if (!apiKey) {
      setError("Please set your Mistral API key in Settings");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          template: selectedTemplate.id,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data.code);

      await supabase.from("generations").insert({
        prompt: prompt.trim(),
        template: selectedTemplate.id,
        result: data.code,
        status: "completed",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="neon-text-purple">Build</span>{" "}
          <span className="text-gray-200">your vision</span>
        </h1>
        <p className="text-sm text-gray-500 max-w-lg">
          Select a template, describe your website, and let AI generate a
          fully responsive cyberpunk-themed site in seconds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Templates
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate.id === template.id}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <PromptInput value={prompt} onChange={setPrompt} disabled={loading} />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
            {error}
          </div>
        )}

        <GenerateButton
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          loading={loading}
        />
      </section>

      {result && (
        <section>
          <ResultPreview code={result} onClose={() => setResult(null)} />
        </section>
      )}
    </div>
  );
}
