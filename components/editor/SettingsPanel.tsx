"use client";

import { useAppStore } from "@/lib/store";
import { ENVIRONMENTS, MODELS } from "@/lib/templates";
import { X, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SettingsPanel() {
  const {
    showSettings, setShowSettings,
    environment, resetProject,
    model, setModel,
  } = useAppStore();

  const [confirmReset, setConfirmReset] = useState(false);

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={() => setShowSettings(false)}
          className="absolute top-3 right-3 p-1.5 hover:bg-card-hover rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold mb-5">Settings</h2>

        {/* Environment */}
        <section className="mb-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Environment
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env.id}
                onClick={() => resetProject(env.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors",
                  environment === env.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{env.icon}</span>
                  <span className="font-medium text-sm">{env.name}</span>
                  {environment === env.id && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{env.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Model */}
        <section className="mb-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            AI Model
          </h3>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </section>

        {/* Reset */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Danger Zone
          </h3>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={() => { resetProject(environment); setConfirmReset(false); setShowSettings(false); }}
                className="flex-1 px-3 py-2 bg-danger text-white rounded-lg text-sm"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 bg-secondary rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full px-3 py-2 bg-secondary hover:bg-danger/20 border border-border hover:border-danger text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset project files
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
