"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Toolbar from "@/components/editor/Toolbar";
import FileTree from "@/components/editor/FileTree";
import CodeEditor from "@/components/editor/CodeEditor";
import Preview from "@/components/editor/Preview";
import AgentChat from "@/components/editor/AgentChat";
import SettingsPanel from "@/components/editor/SettingsPanel";
import { Loader2 } from "lucide-react";

export default function ProjectPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { projects, activeProjectId, setActiveProjectId, viewMode, showChat } = useAppStore();

  const project = projects[id];

  useEffect(() => {
    if (!project) {
      router.push("/");
    } else if (activeProjectId !== id) {
      setActiveProjectId(id);
    }
  }, [id, project, activeProjectId, setActiveProjectId, router]);

  if (!project) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r border-border bg-card/30 shrink-0 hidden md:block">
          <FileTree />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {(viewMode === "code" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} border-r border-border overflow-hidden`}>
              <CodeEditor />
            </div>
          )}

          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} overflow-hidden`}>
              <Preview />
            </div>
          )}
        </div>

        {showChat && (
          <div className="w-80 border-l border-border shrink-0 hidden lg:block">
            <AgentChat />
          </div>
        )}
      </div>

      <SettingsPanel />
    </div>
  );
}
