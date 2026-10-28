"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getWebContainer } from "@/lib/webcontainer";
import { Play, Loader2, RefreshCw, AlertCircle } from "lucide-react";

export default function Preview() {
  const { files, environment } = useAppStore();
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "booting" | "installing" | "starting" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bootedRef = useRef(false);

  const buildHtml = () => {
    const html = files["index.html"] || "";
    const css = files["style.css"] || "";
    const js = files["script.js"] || "";
    return html
      .replace('<link rel="stylesheet" href="style.css" />', `<style>${css}</style>`)
      .replace('<script src="script.js"></script>', `<script>${js}</script>`);
  };

  async function run() {
    setError(null);
    if (environment === "html") {
      setStatus("ready");
      return;
    }

    try {
      setStatus("booting");
      const wc = await getWebContainer();

      if (!bootedRef.current) {
        await wc.mount(
          Object.fromEntries(
            Object.entries(files).map(([path, content]) => [
              path,
              { file: { contents: content } },
            ])
          )
        );
        bootedRef.current = true;
      } else {
        // sync updates
        for (const [path, content] of Object.entries(files)) {
          await wc.fs.writeFile(path, content);
        }
      }

      wc.on("server-ready", (_port, serverUrl) => {
        setUrl(serverUrl);
        setStatus("ready");
      });

      setStatus("installing");
      const install = await wc.spawn("npm", ["install"]);
      install.output.pipeTo(new WritableStream({ write: (d) => console.log(d) }));
      await install.exit;

      setStatus("starting");
      const dev = await wc.spawn("npm", ["run", "dev"]);
      dev.output.pipeTo(new WritableStream({ write: (d) => console.log(d) }));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to start preview");
      setStatus("error");
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (environment === "html" && status === "ready") {
    return (
      <div className="h-full w-full bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          srcDoc={buildHtml()}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          title="preview"
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-danger" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={run}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm capitalize">{status}...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={run}
          className="p-2 bg-card/90 border border-border rounded-lg hover:border-primary/50"
          title="Restart"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        src={url}
        title="preview"
      />
    </div>
  );
}
