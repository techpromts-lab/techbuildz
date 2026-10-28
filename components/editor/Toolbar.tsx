"use client";

import { useAppStore } from "@/lib/store";
import { MODELS } from "@/lib/templates";
import {
  Code2, Eye, Columns2, Settings, MessageSquare, Github,
  Play, Loader2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Toolbar() {
  const {
    viewMode, setViewMode,
    showChat, setShowChat,
    setShowSettings,
    model, setModel,
    files,
  } = useAppStore();

  const [exporting, setExporting] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  async function exportToGitHub() {
    setExporting(true);
    try {
      const repoName = prompt("Repo name?", "techbuildz-project");
      if (!repoName) return;
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, repoName, isPrivate: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.open(data.url, "_blank");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="h-12 border-b border-border bg-card/60 flex items-center px-3 gap-2 shrink-0">
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm">
          tech<span className="text-primary">buildz</span>
        </span>
      </div>

      {/* View mode */}
      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        {[
          { id: "code", icon: Code2 },
          { id: "split", icon: Columns2 },
          { id: "preview", icon: Eye },
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setViewMode(id as any)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            )}
            title={id}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Model select */}
      <div className="relative">
        <button
          onClick={() => setModelOpen((v) => !v)}
          className="px-2.5 py-1.5 text-xs bg-secondary hover:bg-card-hover rounded-lg flex items-center gap-1.5"
        >
          {MODELS.find((m) => m.id === model)?.name || model}
          <ChevronDown className="w-3 h-3" />
        </button>
        {modelOpen && (
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 w-60 z-50">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { setModel(m.id); setModelOpen(false); }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs hover:bg-card-hover",
                  model === m.id && "text-primary"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GitHub */}
      <button
        onClick={exportToGitHub}
        disabled={exporting}
        className="px-2.5 py-1.5 text-xs bg-secondary hover:bg-card-hover rounded-lg flex items-center gap-1.5"
        title="Export to GitHub"
      >
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
        <span className="hidden md:inline">GitHub</span>
      </button>

      {/* Chat toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={cn(
          "p-1.5 rounded-lg",
          showChat ? "bg-primary text-white" : "bg-secondary hover:bg-card-hover text-muted-foreground"
        )}
        title="Toggle chat"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </button>

      {/* Settings */}
      <button
        onClick={() => setShowSettings(true)}
        className="p-1.5 rounded-lg bg-secondary hover:bg-card-hover text-muted-foreground"
        title="Settings"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
