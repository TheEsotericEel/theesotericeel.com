"use client";
import { useState } from "react";
import { useEffect } from "react";

export default function EbayTitleOptimizer() {
  const [title, setTitle] = useState("");
  const [optimized, setOptimized] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

   useEffect(() => {
    document.body.classList.add('ebay-gradient-bg');
    return () => document.body.classList.remove('ebay-gradient-bg');
  }, []);
  
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
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-100 via-blue-200 to-blue-400">
      <section className="w-full max-w-lg bg-white/90 rounded-2xl shadow-xl p-8 border border-slate-200">
        <h1 className="text-3xl font-bold mb-4 text-slate-800 text-center">
          eBay Title Optimizer
        </h1>
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Paste your eBay title, keywords, or description here"
          rows={3}
        />
        <div className="text-right text-xs mb-4 text-slate-500">
          Input characters: {title.length}
        </div>
        <button
          className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
            loading || !title.trim()
              ? "bg-blue-300 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={handleOptimize}
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <span className="animate-pulse">Optimizing...</span>
          ) : (
            "Optimize"
          )}
        </button>
        {optimized && (
          <div className="mt-8 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-700 shadow">
            <h2 className="font-semibold mb-2 text-lg">Optimized Title:</h2>
            <div className="break-words">{optimized}</div>
            <div className="text-right text-xs mt-2 text-slate-400">
              Output characters: {optimized.length}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-blue-400">
                Show debug info
              </summary>
              <div className="text-xs mt-2 font-mono whitespace-pre-wrap">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </details>
          </div>
        )}
      </section>
    </main>
  );
}
