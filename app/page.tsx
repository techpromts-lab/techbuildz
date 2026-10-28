"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Code2, Sparkles, Zap, Github, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              tech<span className="text-primary">buildz</span>
            </h1>
            <p className="text-sm text-muted-foreground">by techpromts</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-2xl mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Vibe Coding
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              with AI
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Build any project in seconds with{" "}
            <span className="text-primary font-medium">techpromts agent</span>.
            <br />
            Next.js • React • Node • and more
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/project/new")}
              className="group relative px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-glow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Start Coding
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-card border border-border hover:border-primary/50 text-foreground font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
        >
          {[
            {
              icon: <Zap className="w-6 h-6 text-primary" />,
              title: "Blazing Fast",
              desc: "Powered by Groq + Llama 3.3",
            },
            {
              icon: <Code2 className="w-6 h-6 text-accent" />,
              title: "All Environments",
              desc: "Next.js, React, Node, HTML...",
            },
            {
              icon: <Sparkles className="w-6 h-6 text-warning" />,
              title: "techpromts agent",
              desc: "Writes and edits code with you",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:border-primary/30 transition-all"
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        <p className="mt-16 text-sm text-muted-foreground">
          Made with ❤️ by techpromts • 2026
        </p>
      </div>
    </div>
  );
}
