"use client";

import { useAppStore } from "@/lib/store";
import { FileCode, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FileTree() {
  const { files, activeFile, setActiveFile } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    app: true,
    src: true,
  });

  const tree: Record<string, string[]> = {};
  const rootFiles: string[] = [];

  Object.keys(files).forEach((path) => {
    const parts = path.split("/");
    if (parts.length === 1) {
      rootFiles.push(path);
    } else {
      const folder = parts[0];
      if (!tree[folder]) tree[folder] = [];
      tree[folder].push(path);
    }
  });

  return (
    <div className="h-full overflow-y-auto p-3 text-sm">
      <div className="text-xs font-medium text-muted-foreground mb-3 px-2 uppercase tracking-wider">
        Files
      </div>

      {Object.entries(tree).map(([folder, paths]) => (
        <div key={folder} className="mb-1">
          <button
            onClick={() =>
              setExpanded((prev) => ({ ...prev, [folder]: !prev[folder] }))
            }
            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded[folder] ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <Folder className="w-4 h-4 text-primary" />
            <span>{folder}</span>
          </button>

          {expanded[folder] &&
            paths.map((path) => {
              const name = path.split("/").slice(1).join("/");
              return (
                <button
                  key={path}
                  onClick={() => setActiveFile(path)}
                  className={cn(
                    "flex items-center gap-2 w-full pl-8 pr-2 py-1.5 rounded-lg transition-colors",
                    activeFile === path
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-card-hover text-muted-foreground hover:text-foreground"
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
            activeFile === path
              ? "bg-primary/20 text-primary"
              : "hover:bg-card-hover text-muted-foreground hover:text-foreground"
          )}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span className="truncate">{path}</span>
        </button>
      ))}
    </div>
  );
}
