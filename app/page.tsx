"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Sparkles, Plus, Trash2, FolderOpen, Clock, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ENVIRONMENTS, Environment } from "@/lib/templates";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { projects, createProject, deleteProject } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("My Awesome Project");
  const [selectedEnv, setSelectedEnv] = useState<Environment>("empty");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const projectList = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    const id = createProject(newProjectName, selectedEnv);
    router.push(`/project/${id}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
             
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow shrink-0">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-bold">
                  tech<span className="text-primary">buildz</span>
                </h1>
                <span className="text-sm font-medium text-muted-foreground">
                  by techpromts
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Your Projects Dashboard</p>
            </div>
          </div>
                     
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-glow flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 border border-border border-dashed rounded-2xl">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No projects yet. Start building your first app!</p>
            </div>
          )}
          {projectList.map((project) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={project.id}
              className="group bg-card border border-border hover:border-primary/50 rounded-2xl p-5 cursor-pointer transition-all relative flex flex-col justify-between h-40"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md mt-2 inline-block capitalize">
                    {project.environment}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this project permanently?")) {
                      deleteProject(project.id);
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                <Clock className="w-3.5 h-3.5" />
                Updated: {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Create New Project
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-card-hover rounded-lg text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Environment</label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                    {ENVIRONMENTS.map((env) => (
                      <button
                        key={env.id}
                        onClick={() => setSelectedEnv(env.id)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-colors",
                          selectedEnv === env.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{env.icon}</span>
                          <span className="font-medium text-sm">{env.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{env.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-border flex justify-end gap-3 bg-card/50">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm hover:bg-card-hover rounded-lg">Cancel</button>
                <button onClick={handleCreate} disabled={!newProjectName.trim()} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50">Create & Start</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
