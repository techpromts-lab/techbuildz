"use client";

import { useAppStore } from "@/lib/store";
import { FileCode, Folder, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FileTree() {
  const { projects, activeProjectId, setActiveFile, addFile } = useAppStore();
  const project = projects[activeProjectId || ""];
  const files = project?.files || {};
  const activeFile = project?.activeFile || "";

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ app: true, src: true });

  const handleAddFile = () => {
    const name = prompt("File name (e.g., index.html, src/App.tsx):");
    if (name && !files[name]) {
      addFile(name);
    } else if (name && files[name]) {
      alert("File already exists!");
    }
  };

  const tree: Record<string, string[]> = {};
  const rootFiles: string[] = [];

  Object.keys(files).forEach((path) => {
    const parts = path.split("/");
    if (parts.length === 1) rootFiles.push(path);
    else {
      const folder = parts[0];
      if (!tree[folder]) tree[folder] = [];
      tree[folder].push(path);
    }
  });

  const isEmpty = Object.keys(files).length === 0;

  return (
    <div className="h-full overflow-y-auto p-3 text-sm flex flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</div>
        <button onClick={handleAddFile} className="p-1 hover:bg-card-hover rounded text-muted-foreground hover:text-primary transition-colors" title="New File">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isEmpty && (
        <div className="px-2 py-6 text-center text-muted-foreground text-xs leading-relaxed bg-card/30 rounded-lg border border-border border-dashed">
          <p className="mb-2">Project is empty.</p>
          <p>Click <strong>+</strong> to create a file, or ask the AI agent!</p>
        </div>
      )}

      {Object.entries(tree).map(([folder, paths]) => (
        <div key={folder} className="mb-1">
          <button
            onClick={() => setExpanded((prev) => ({ ...prev, [folder]: !prev[folder] }))}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded[folder] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Folder className="w-4 h-4 text-primary" />
            <span>{folder}</span>
          </button>

          {expanded[folder] && paths.map((path) => {
            const name = path.split("/").slice(1).join("/");
            return (
              <button
                key={path}
                onClick={() => setActiveFile(path)}
                className={cn(
                  "flex items-center gap-2 w-full pl-8 pr-2 py-1.5 rounded-lg transition-colors",
                  activeFile === path ? "bg-primary/20 text-primary" : "hover:bg-card-hover text-muted-foreground hover:text-foreground"
                )}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="truncate">{name}</span>
              </button>
            );
          })}
        </div>
      ))}

      {rootFiles.map((path) => (
        <button
          key={path}
          onClick={() => setActiveFile(path)}
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-colors",
            activeFile === path ? "bg-primary/20 text-primary" : "hover:bg-card-hover text-muted-foreground hover:text-foreground"
          )}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span className="truncate">{path}</span>
        </button>
      ))}
    </div>
  );
}
