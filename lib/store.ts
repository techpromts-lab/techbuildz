import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Environment, getInitialFiles } from "./templates";

export interface Project {
  id: string;
  name: string;
  environment: Environment;
  files: Record<string, string>;
  activeFile: string;
  messages: { role: "user" | "assistant"; content: string }[];
  model: string;
  updatedAt: number;
}

interface AppState {
  projects: Record<string, Project>;
  activeProjectId: string | null;
  showChat: boolean;
  showSettings: boolean;
  viewMode: "split" | "code" | "preview";
  isGenerating: boolean;
  createProject: (name: string, env: Environment) => string;
  deleteProject: (id: string) => void;
  setActiveProjectId: (id: string) => void;
  updateFile: (path: string, content: string) => void;
  addFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  setFiles: (files: Record<string, string>) => void;
  updateProjectName: (name: string) => void;
  setEnvironment: (env: Environment) => void;
  setModel: (model: string) => void;
  addMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  resetProject: () => void;
  setShowChat: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setViewMode: (mode: "split" | "code" | "preview") => void;
  setIsGenerating: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: {},
      activeProjectId: null,
      showChat: true,
      showSettings: false,
      viewMode: "split",
      isGenerating: false,

      createProject: (name, env) => {
        const id = crypto.randomUUID();
        const files = getInitialFiles(env);
        const newProject: Project = {
          id, 
          name: name || "Untitled Project", 
          environment: env, 
          files,
          activeFile: Object.keys(files)[0] || "", 
          messages: [], 
          model: "gemini-2.5-flash", // التعديل هنا
          updatedAt: Date.now(),
        };
        set((s) => ({ projects: { ...s.projects, [id]: newProject }, activeProjectId: id }));
        return id;
      },
      deleteProject: (id) => set((s) => {
        const newProjects = { ...s.projects };
        delete newProjects[id];
        return { projects: newProjects, activeProjectId: s.activeProjectId === id ? null : s.activeProjectId };
      }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      updateFile: (path, content) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, files: { ...p.files, [path]: content }, updatedAt: Date.now() } } };
      }),
      addFile: (path) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, files: { ...p.files, [path]: "" }, activeFile: path, updatedAt: Date.now() } } };
      }),
      setActiveFile: (path) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, activeFile: path } } };
      }),
      setFiles: (files) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, files, updatedAt: Date.now() } } };
      }),
      updateProjectName: (name) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, name, updatedAt: Date.now() } } };
      }),
      setEnvironment: (env) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, environment: env } } };
      }),
      setModel: (model) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, model } } };
      }),
      addMessage: (msg) => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        return { projects: { ...s.projects, [p.id]: { ...p, messages: [...p.messages, msg] } } };
      }),
      resetProject: () => set((s) => {
        const p = s.projects[s.activeProjectId!];
        if (!p) return s;
        const files = getInitialFiles(p.environment);
        return { projects: { ...s.projects, [p.id]: { ...p, files, activeFile: Object.keys(files)[0] || "", messages: [], updatedAt: Date.now() } } };
      }),
      setShowChat: (v) => set({ showChat: v }),
      setShowSettings: (v) => set({ showSettings: v }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsGenerating: (v) => set({ isGenerating: v }),
    }),
    { name: "techbuildz-storage", partialize: (state) => ({ projects: state.projects }) }
  )
);
