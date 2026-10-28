export type Environment = "nextjs" | "react-vite" | "node" | "html";

export const ENVIRONMENTS = [
  { id: "nextjs" as Environment, name: "Next.js 15", description: "App Router + TypeScript", icon: "▲" },
  { id: "react-vite" as Environment, name: "React + Vite", description: "Fast React", icon: "⚛" },
  { id: "node" as Environment, name: "Node.js", description: "Express / Node", icon: "🟢" },
  { id: "html" as Environment, name: "HTML / CSS / JS", description: "Static site", icon: "🌐" },
];

export const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (موصى به)" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (سريع)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
];

export function getInitialFiles(env: Environment): Record<string, string> {
  if (env === "nextjs") {
    return {
      "package.json": JSON.stringify({
        name: "techbuildz-project",
        private: true,
        scripts: { dev: "next dev --port 3000", build: "next build", start: "next start" },
        dependencies: { next: "15.1.0", react: "^19.0.0", "react-dom": "^19.0.0" },
        devDependencies: { typescript: "^5.7.2", "@types/react": "^19.0.2", "@types/node": "^22.10.2" }
      }, null, 2),
      "app/page.tsx": `export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Welcome to techbuildz 🚀</h1>
      <p>Edit this file and see the magic.</p>
    </main>
  );
}`,
      "app/layout.tsx": `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true,
          skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true,
          module: "esnext", moduleResolution: "bundler", resolveJsonModule: true,
          isolatedModules: true, jsx: "preserve", incremental: true, paths: { "@/*": ["./*"] }
        },
        include: ["**/*.ts", "**/*.tsx"], exclude: ["node_modules"]
      }, null, 2),
      "next.config.js": `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;`
    };
  }

  if (env === "react-vite") {
    return {
      "package.json": JSON.stringify({
        name: "techbuildz-react", private: true, type: "module",
        scripts: { dev: "vite --port 3000", build: "vite build" },
        dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
        devDependencies: { "@vitejs/plugin-react": "^4.3.4", vite: "^6.0.3" }
      }, null, 2),
      "index.html": `<!DOCTYPE html><html><head><title>techbuildz</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
      "src/main.jsx": `import { createRoot } from "react-dom/client";\nimport App from "./App";\ncreateRoot(document.getElementById("root")).render(<App />);`,
      "src/App.jsx": `export default function App() {\n  return <div style={{padding:40}}><h1>Welcome to techbuildz 🚀</h1></div>;\n}`,
      "vite.config.js": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nexport default defineConfig({ plugins: [react()], server: { port: 3000 } });`
    };
  }

  if (env === "node") {
    return {
      "package.json": JSON.stringify({ name: "techbuildz-node", scripts: { dev: "node index.js" } }, null, 2),
      "index.js": `const http = require("http");\nhttp.createServer((req, res) => {\n  res.writeHead(200, {"Content-Type":"text/html"});\n  res.end("<h1>Hello from techbuildz 🚀</h1>");\n}).listen(3000);`
    };
  }

  // html default
  return {
    "index.html": `<!DOCTYPE html><html><head><title>techbuildz</title><link rel="stylesheet" href="style.css"></head><body><h1>Welcome to techbuildz 🚀</h1><script src="script.js"></script></body></html>`,
    "style.css": `body{font-family:system-ui;background:#0a0a0f;color:#f1f1f4;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}`,
    "script.js": `console.log("techbuildz ready 🚀");`
  };
}
