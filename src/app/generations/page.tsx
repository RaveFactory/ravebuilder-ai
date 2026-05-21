"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ResultPreview from "@/components/ResultPreview";

interface Generation {
  id: string;
  prompt: string;
  template: string;
  result: string;
  status: string;
  created_at: string;
}

const templateColors: Record<string, string> = {
  cyberpunk: "text-neon-purple",
  hardtek: "text-neon-pink",
  jungle: "text-neon-green",
  minimal: "text-neon-blue",
};

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setGenerations(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("generations").delete().eq("id", id);
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedGeneration = generations.find((g) => g.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-neon-purple border-t-transparent" />
          <p className="text-sm text-gray-500">Loading generations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="neon-text-blue">My</span>{" "}
          <span className="text-gray-200">Generations</span>
        </h1>
        <p className="text-sm text-gray-500">
          View and manage your previously generated websites.
        </p>
      </section>

      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-4xl opacity-30">📁</div>
          <p className="text-sm text-gray-500">No generations yet</p>
          <p className="mt-1 text-xs text-gray-600">
            Generate your first website from the Dashboard
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className={`cyber-card p-4 cursor-pointer transition-all duration-300 ${
                selectedId === gen.id
                  ? "border-neon-purple/60 shadow-neon-purple"
                  : ""
              }`}
              onClick={() =>
                setSelectedId(selectedId === gen.id ? null : gen.id)
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        templateColors[gen.template] || "text-gray-400"
                      }`}
                    >
                      {gen.template}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(gen.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-300 line-clamp-2">
                    {gen.prompt}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(gen.id);
                  }}
                  className="shrink-0 rounded-lg p-2 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {selectedId === gen.id && gen.result && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <ResultPreview
                    code={gen.result}
                    onClose={() => setSelectedId(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
