"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

function extractFiles(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const regex = /(?:`([\w./-]+\.[a-zA-Z0-9]+)`|\*\*([\w./-]+\.[a-zA-Z0-9]+)\*\*|^([\w./-]+\.[a-zA-Z0-9]+)\s*$)\s*\n*```[a-zA-Z0-9]*\n([\s\S]*?)```/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const name = m[1] || m[2] || m[3];
    const code = m[4];
    if (name && code) out[name] = code.replace(/\n$/, "");
  }
  return out;
}

export default function AgentChat() {
  const { projects, activeProjectId, addMessage, isGenerating, setIsGenerating, setFiles } = useAppStore();
  const project = projects[activeProjectId || ""];
  const files = project?.files || {};
  const activeFile = project?.activeFile || "";
  const messages = project?.messages || [];
  const model = project?.model || "llama-3.3-70b-versatile";
  const environment = project?.environment || "empty";

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isGenerating]);

  async function send() {
    const text = input.trim();
    if (!text || isGenerating) return;
    setInput("");
    addMessage({ role: "user", content: text });
    setIsGenerating(true);

    try {
      const contextMsg = {
        role: "user" as const,
        content: `Environment: ${environment}\nCurrent files: ${Object.keys(files).join(", ") || "None"}\nActive file: ${activeFile || "None"}\n\n${text}`,
      };
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [...messages, contextMsg] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const reply: string = data.reply;
      addMessage({ role: "assistant", content: reply });

      const newFiles = extractFiles(reply);
      if (Object.keys(newFiles).length > 0) {
        setFiles({ ...files, ...newFiles });
      }
    } catch (e: any) {
      addMessage({ role: "assistant", content: `⚠️ ${e.message}` });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-9 flex items-center px-4 border-b border-border bg-card/50 text-xs font-medium">
        techpromts agent
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground text-center mt-8 px-4">
            Ask the agent to build or edit anything. It writes full files for you.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="flex gap-2">
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", m.role === "user" ? "bg-secondary" : "bg-primary/20")}>
              {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
            </div>
            <div className="text-xs leading-relaxed whitespace-pre-wrap break-words flex-1 pt-0.5">
              {m.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> thinking...
          </div>
        )}
      </div>

      <div className="border-t border-border p-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Ask techpromts agent..."
            className="flex-1 resize-none bg-card border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60"
          />
          <button onClick={send} disabled={isGenerating || !input.trim()} className="p-2 bg-primary hover:bg-primary-hover disabled:opacity-40 rounded-lg">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
