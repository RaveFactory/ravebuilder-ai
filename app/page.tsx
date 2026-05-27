"use client";

console.log("NEW BUILD TEST");

import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!data.pages) {
        alert(JSON.stringify(data));
        return;
      }

      setHtml(data.pages[0].html);
    } catch (error) {
      console.error(error);
      alert(String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>RaveBuilder AI</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your website..."
        style={{
          width: "100%",
          height: "120px",
          marginTop: "20px",
          padding: "12px",
          background: "#111",
          color: "white",
          border: "1px solid #333",
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: "#00ff88",
          color: "black",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {html && (
        <iframe
          srcDoc={html}
          style={{
            width: "100%",
            height: "800px",
            marginTop: "30px",
            border: "1px solid #333",
            background: "white",
          }}
        />
      )}
    </div>
  );
}
