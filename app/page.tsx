"use client";

import Toolbar from "@/components/editor/Toolbar";
import FileTree from "@/components/editor/FileTree";
import CodeEditor from "@/components/editor/CodeEditor";
import Preview from "@/components/editor/Preview";
import AgentChat from "@/components/editor/AgentChat";
import SettingsPanel from "@/components/editor/SettingsPanel";
import { useAppStore } from "@/lib/store";

export default function ProjectPage() {
  const { viewMode, showChat } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-56 border-r border-border bg-card/30 shrink-0 hidden md:block">
          <FileTree />
        </div>

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden">
          {(viewMode === "code" || viewMode === "split") && (
            <div
              className={`${
                viewMode === "split" ? "w-1/2" : "w-full"
              } border-r border-border overflow-hidden`}
            >
              <CodeEditor />
            </div>
          )}

          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`${
                viewMode === "split" ? "w-1/2" : "w-full"
              } overflow-hidden`}
            >
              <Preview />
            </div>
          )}
        </div>

        {/* Chat */}
        {showChat && (
          <div className="w-80 border-l border-border shrink-0 hidden lg:block">
            <AgentChat />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsPanel />
    </div>
  );
}
