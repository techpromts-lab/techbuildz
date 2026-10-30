"use client";
import { useAppStore } from "@/lib/store";
import { MODELS } from "@/lib/templates";
import { Code2, Eye, Columns2, Settings, MessageSquare, Github, Loader2, ChevronDown, Edit2, Check, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Toolbar() {
  const router = useRouter();
  const { viewMode, setViewMode, showChat, setShowChat, setShowSettings, projects, activeProjectId, updateProjectName, setModel } = useAppStore();
  const project = projects[activeProjectId || ""];
  const [exporting, setExporting] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(project?.name || "");
  
  if (!project) return null;

  async function exportToGitHub() {
    setExporting(true);
    try {
      const repoName = prompt("Repo name?", project.name.toLowerCase().replace(/\s+/g, '-'));
      if (!repoName) return;
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: project.files, repoName, isPrivate: false }),
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

  const saveName = () => {
    if (nameInput.trim()) updateProjectName(nameInput.trim());
    else setNameInput(project.name);
    setEditingName(false);
  };

  return (
    <div className="h-12 border-b border-border bg-card/60 flex items-center px-3 gap-3 shrink-0">
      <button onClick={() => router.push("/")} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card-hover rounded-lg transition-colors" title="Back to Projects">
        <Home className="w-4 h-4" />
      </button>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
        <Code2 className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-center gap-2">
        {editingName ? (
          <div className="flex items-center gap-1">
            <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveName()} onBlur={saveName} className="bg-secondary border border-border rounded px-2 py-1 text-sm w-40 focus:outline-none focus:border-primary" />
            <button onClick={saveName} className="p-1 hover:bg-card-hover rounded text-primary">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => { setNameInput(project.name); setEditingName(true); }} title="Click to rename">
            <span className="font-semibold text-sm truncate max-w-[150px]">{project.name}</span>
            <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        {[
          { id: "code", icon: Code2 },
          { id: "split", icon: Columns2 },
          { id: "preview", icon: Eye },
        ].map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => setViewMode(id as any)} className={cn("p-1.5 rounded-md transition-colors", viewMode === id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <div className="relative">
        <button onClick={() => setModelOpen((v) => !v)} className="px-2.5 py-1.5 text-xs bg-secondary hover:bg-card-hover rounded-lg flex items-center gap-1.5">
          {MODELS.find((m) => m.id === project.model)?.name || project.model}
          <ChevronDown className="w-3 h-3" />
        </button>
        {modelOpen && (
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 w-60 z-50">
            {MODELS.map((m) => (
              <button key={m.id} onClick={() => { setModel(m.id); setModelOpen(false); }} className={cn("w-full text-left px-3 py-1.5 text-xs hover:bg-card-hover", project.model === m.id && "text-primary")}>
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={exportToGitHub} disabled={exporting || Object.keys(project.files).length === 0} className="px-2.5 py-1.5 text-xs bg-secondary hover:bg-card-hover rounded-lg flex items-center gap-1.5 disabled:opacity-50">
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
        <span className="hidden md:inline">GitHub</span>
      </button>
      <button onClick={() => setShowChat(!showChat)} className={cn("p-1.5 rounded-lg", showChat ? "bg-primary text-white" : "bg-secondary hover:bg-card-hover text-muted-foreground")}>
        <MessageSquare className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-lg bg-secondary hover:bg-card-hover text-muted-foreground">
        <Settings className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
