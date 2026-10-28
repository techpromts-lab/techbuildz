import { create } from "zustand";
import { Environment, getInitialFiles } from "./templates";

interface AppState {
  files: Record<string, string>;
  activeFile: string;
  environment: Environment;
  model: string;
  showChat: boolean;
  showSettings: boolean;
  viewMode: "split" | "code" | "preview";
  messages: { role: "user" | "assistant"; content: string }[];
  isGenerating: boolean;
  setFiles: (files: Record<string, string>) => void;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
  setEnvironment: (env: Environment) => void;
  setModel: (model: string) => void;
  setShowChat: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setViewMode: (mode: "split" | "code" | "preview") => void;
  addMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  setIsGenerating: (v: boolean) => void;
  resetProject: (env: Environment) => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: getInitialFiles("nextjs"),
  activeFile: "app/page.tsx",
  environment: "nextjs",
  model: "llama-3.3-70b-versatile",
  showChat: true,
  showSettings: false,
  viewMode: "split",
  messages: [],
  isGenerating: false,

  setFiles: (files) => set({ files }),
  updateFile: (path, content) => set((s) => ({ files: { ...s.files, [path]: content } })),
  setActiveFile: (path) => set({ activeFile: path }),
  setEnvironment: (env) => set({ environment: env }),
  setModel: (model) => set({ model }),
  setShowChat: (v) => set({ showChat: v }),
  setShowSettings: (v) => set({ showSettings: v }),
  setViewMode: (mode) => set({ viewMode: mode }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setIsGenerating: (v) => set({ isGenerating: v }),
  resetProject: (env) => {
    const files = getInitialFiles(env);
    set({ environment: env, files, activeFile: Object.keys(files)[0], messages: [] });
  },
}));
