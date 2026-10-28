export type Environment = "nextjs" | "react-vite" | "node" | "html";

export const ENVIRONMENTS = [
  {
    id: "nextjs" as Environment,
    name: "Next.js 15",
    description: "App Router + TypeScript + Tailwind",
    icon: "▲",
  },
  {
    id: "react-vite" as Environment,
    name: "React + Vite",
    description: "Fast React with Vite",
    icon: "⚛",
  },
  {
    id: "node" as Environment,
    name: "Node.js",
    description: "Express / plain Node",
    icon: "🟢",
  },
  {
    id: "html" as Environment,
    name: "HTML / CSS / JS",
    description: "Simple static site",
    icon: "🌐",
  },
];

export const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Recommended)" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Fast)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

export function getInitialFiles(env: Environment): Record<string, string> {
  if (env === "nextjs") {
    return {
      "package.json": JSON.stringify(
        {
          name: "techbuildz-project",
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev --port 3000",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            next: "15.1.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
          },
          devDependencies: {
            typescript: "^5.7.2",
            "@types/react": "^19.0.2",
            "@types/node": "^22.10.2",
          },
        },
        null,
        2
      ),
      "app/page.tsx": `export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Welcome to techbuildz 🚀</h1>
      <p>Edit this file and see the magic.</p>
    </main>
  );
}
`,
      "app/layout.tsx": `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
      "tsconfig.json": JSON.stringify(
        {
          compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
          exclude: ["node_modules"],
        },
        null,
        2
      ),
      "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`,
    };
  }

  if (env === "react-vite") {
    return {
      "package.json": JSON.stringify(
        {
          name: "techbuildz-react",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite --port 3000",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            react: "^19.0.0",
            "react-dom": "^19.0.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.3.4",
            vite: "^6.0.3",
          },
        },
        null,
        2
      ),
      "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>techbuildz</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      "src/main.jsx": `import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);
`,
      "src/App.jsx": `export default function App() {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Welcome to techbuildz 🚀</h1>
      <p>React + Vite is ready.</p>
    </div>
  );
}
`,
      "vite.config.js": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
`,
    };
  }

  if (env === "node") {
    return {
      "package.json": JSON.stringify(
        {
          name: "techbuildz-node",
          version: "1.0.0",
          scripts: {
            start: "node index.js",
            dev: "node index.js",
          },
        },
        null,
        2
      ),
      "index.js": `const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Hello from techbuildz Node.js 🚀</h1>");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
`,
    };
  }

  // HTML default
  return {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>techbuildz</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Welcome to techbuildz 🚀</h1>
  <p>Edit me and see the preview live.</p>
  <script src="script.js"></script>
</body>
</html>
`,
    "style.css": `body {
  font-family: system-ui, sans-serif;
  background: #0a0a0f;
  color: #f1f1f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
}
h1 {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`,
    "script.js": `console.log("techbuildz is ready 🚀");
`,
  };
}
