"use client";
import { useState } from "react";

export default function EbayTitleOptimizer() {
  const [title, setTitle] = useState("");
  const [optimized, setOptimized] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleOptimize() {
    setLoading(true);
    setOptimized("");
    setLogs([]);
    const response = await fetch("/api/ebay-title-optimizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json();
    setOptimized(data.optimized);
    setLogs(data.logs || []);
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded-xl">
      <h1 className="text-2xl font-bold mb-4">eBay Title Optimizer</h1>
      <textarea
        className="w-full border p-2 rounded mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Paste your eBay title, keywords, or description here"
        rows={3}
      />
      <div className="text-right text-xs mb-2 text-gray-500">
        Input characters: {title.length}
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleOptimize}
        disabled={loading || !title.trim()}
      >
        {loading ? "Optimizing..." : "Optimize"}
      </button>
      {optimized && (
        <div className="mt-4 p-2 rounded border"
             style={{ background: "#171923", color: "#f7fafc" }}>
          <h2 className="font-semibold mb-1">Optimized Title:</h2>
          <div>{optimized}</div>
          <div className="text-right text-xs mt-2 text-gray-400">
            Output characters: {optimized.length}
          </div>
          <div className="mt-4">
            <details>
              <summary className="cursor-pointer text-xs text-blue-400">Show debug info</summary>
              <div className="text-xs mt-2 font-mono whitespace-pre-wrap">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
