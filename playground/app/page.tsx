"use client";

import { useState } from "react";
import { MaskingPlayground } from "./components/MaskingPlayground";
import { Examples } from "./components/Examples";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"playground" | "examples">("playground");

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LogVeil Playground
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                Privacy-first logging utility - Test PII/PHI masking in real-time
              </p>
            </div>
            <a
              href="https://github.com/Orace227/logveil"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("playground")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "playground"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Interactive Playground
            </button>
            <button
              onClick={() => setActiveTab("examples")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "examples"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Examples
            </button>
          </div>
        </header>

        {/* Content */}
        <main>
          {activeTab === "playground" && <MaskingPlayground />}
          {activeTab === "examples" && <Examples />}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Made with love by the LogVeil team •{" "}
            <a
              href="https://github.com/Orace227/logveil"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Documentation
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
