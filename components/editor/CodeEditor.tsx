"use client";

import Editor from "@monaco-editor/react";
import { useAppStore } from "@/lib/store";

export default function CodeEditor() {
  const { files, activeFile, updateFile } = useAppStore();
  const content = files[activeFile] || "";

  const language = (() => {
    if (activeFile.endsWith(".tsx") || activeFile.endsWith(".ts")) return "typescript";
    if (activeFile.endsWith(".jsx") || activeFile.endsWith(".js")) return "javascript";
    if (activeFile.endsWith(".css")) return "css";
    if (activeFile.endsWith(".html")) return "html";
    if (activeFile.endsWith(".json")) return "json";
    return "typescript";
  })();

  return (
    <div className="h-full w-full">
      <div className="h-9 flex items-center px-4 border-b border-border bg-card/50 text-xs text-muted-foreground">
        <span className="font-mono">{activeFile}</span>
      </div>
      <Editor
        height="calc(100% - 36px)"
        language={language}
        value={content}
        theme="vs-dark"
        onChange={(value) => {
          if (value !== undefined) updateFile(activeFile, value);
        }}
        options={{
          fontSize: 14,
          fontFamily: "JetBrains Mono, Fira Code, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbers: "on",
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
