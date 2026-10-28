export type Environment = "nextjs" | "react-vite" | "node" | "html" | "empty";

export const ENVIRONMENTS = [
  { id: "empty" as Environment, name: "Empty Project", description: "Start from scratch with zero files", icon: "📁" },
  { id: "nextjs" as Environment, name: "Next.js 15", description: "App Router + TypeScript + Tailwind", icon: "▲" },
  { id: "react-vite" as Environment, name: "React + Vite", description: "Fast React with Vite", icon: "⚛" },
  { id: "node" as Environment, name: "Node.js", description: "Express / plain Node", icon: "🟢" },
  { id: "html" as Environment, name: "HTML / CSS / JS", description: "Simple static site", icon: "🌐" },
];

// تم استخدام المعرّفات الرسمية (id) التي يقبلها API جوجل
export const MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 3.8 Flash (Recommended)" },
  { id: "gemini-1.5-pro", name: "Gemini 3.6 Flash (Smart)" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 3.5 Flash-Lite" },
  { id: "gemini-1.5-flash-8b", name: "Gemini 3.1 Flash-Lite" },
];

export function getInitialFiles(env: Environment): Record<string, string> {
  if (env === "empty") return {};

  if (env === "nextjs") {
    return {
      "package.json": JSON.stringify({ name: "techbuildz-project", version: "0.1.0", private: true, scripts: { dev: "next dev --port 3000", build: "next build", start: "next start" }, dependencies: { next: "15.1.11", react: "^19.0.0", "react-dom": "^19.0.0" }, devDependencies: { typescript: "^5.7.2", "@types/react": "^19.0.2", "@types/node": "^22.10.2" } }, null, 2),
      "app/page.tsx": `export default function Home() {\n  return (\n    <main style={{ padding: 40, fontFamily: "system-ui" }}>\n      <h1>Welcome to techbuildz 🚀</h1>\n      <p>Edit this file and see the magic.</p>\n    </main>\n  );\n}\n`,
      "app/layout.tsx": `export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
      "tsconfig.json": JSON.stringify({ compilerOptions: { target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true, paths: { "@/*": ["./*"] } }, include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"], exclude: ["node_modules"] }, null, 2),
      "next.config.js": `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;\n`,
    };
  }
  if (env === "react-vite") {
    return {
      "package.json": JSON.stringify({ name: "techbuildz-react", private: true, version: "0.0.0", type: "module", scripts: { dev: "vite --port 3000", build: "vite build", preview: "vite preview" }, dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" }, devDependencies: { "@vitejs/plugin-react": "^4.3.4", vite: "^6.0.3" } }, null, 2),
      "index.html": `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>techbuildz</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
      "src/main.jsx": `import { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")).render(<App />);\n`,
      "src/App.jsx": `export default function App() {\n  return (\n    <div style={{ padding: 40, fontFamily: "system-ui" }}>\n      <h1>Welcome to techbuildz 🚀</h1>\n      <p>React + Vite is ready.</p>\n    </div>\n  );\n}\n`,
      "vite.config.js": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 },\n});\n`,
    };
  }
  if (env === "node") {
    return {
      "package.json": JSON.stringify({ name: "techbuildz-node", version: "1.0.0", scripts: { start: "node index.js", dev: "node index.js" } }, null, 2),
      "index.js": `const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/html" });\n  res.end("<h1>Hello from techbuildz Node.js 🚀</h1>");\n});\n\nserver.listen(3000, () => {\n  console.log("Server running on port 3000");\n});\n`,
    };
  }
  return {
    "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>techbuildz</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <h1>Welcome to techbuildz 🚀</h1>\n  <p>Edit me and see the preview live.</p>\n  <script src="script.js"></script>\n</body>\n</html>\n`,
    "style.css": `body {\n  font-family: system-ui, sans-serif;\n  background: #0a0a0f;\n  color: #f1f1f4;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  margin: 0;\n}\nh1 {\n  background: linear-gradient(135deg, #8b5cf6, #06b6d4);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n`,
    "script.js": `console.log("techbuildz is ready 🚀");\n`,
  };
}
