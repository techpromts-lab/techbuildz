"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getWebContainer } from "@/lib/webcontainer";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

type Status =
  | "idle"
  | "booting"
  | "mounting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

type KilledableProcess = { kill: () => void };

export default function Preview() {
  const { projects, activeProjectId } = useAppStore();
  const project = projects[activeProjectId || ""];
  const files = project?.files || {};
  const environment = project?.environment || "empty";

  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // --- Lifecycle guards (fix #1: listener leak + process leak) ---
  const runIdRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const installedEnvRef = useRef<string | null>(null);
  const installProcessRef = useRef<KilledableProcess | null>(null);
  const devProcessRef = useRef<KilledableProcess | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Register server-ready listener ONCE per mount (not per run)
  useEffect(() => {
    const alive = { value: true };
    getWebContainer()
      .then((wc) => {
        if (!alive.value) return;
        wc.on("server-ready", (_port: number, serverUrl: string) => {
          if (!alive.value) return;
          if (statusRef.current !== "starting") return;
          setUrl(serverUrl);
          setStatus("ready");
        });
      })
      .catch((e) => console.error("[preview listener]", e));

    return () => {
      alive.value = false;
    };
  }, []);

  const buildHtml = () => {
    const html = files["index.html"] || "";
    const css = files["style.css"] || "";
    const js = files["script.js"] || "";
    // More tolerant than exact-string replace
    return html
      .replace(
        /<link[^>]*href=["']\.?\/?style\.css["'][^>]*\/?>/i,
        `<style>${css}</style>`
      )
      .replace(
        /<script[^>]*src=["']\.?\/?script\.js["'][^>]*><\/script>/i,
        `<script>${js}</script>`
      );
  };

  const killProcesses = () => {
    try {
      installProcessRef.current?.kill?.();
    } catch {}
    try {
      devProcessRef.current?.kill?.();
    } catch {}
    installProcessRef.current = null;
    devProcessRef.current = null;
  };

  async function run() {
    const runId = ++runIdRef.current;
    setError(null);
    setUrl(null);

    if (environment === "empty" || Object.keys(files).length === 0) {
      setStatus("idle");
      return;
    }

    if (environment === "html") {
      setStatus("ready");
      return;
    }

    try {
      killProcesses();
      if (runId !== runIdRef.current) return;

      setStatus("booting");
      const wc = await getWebContainer();
      if (runId !== runIdRef.current) return;

      const envKey = `${activeProjectId}-${environment}`;
      if (installedEnvRef.current !== envKey) {
        setStatus("mounting");
        await wc.mount(
          Object.fromEntries(
            Object.entries(files).map(([path, content]) => [
              path,
              { file: { contents: content } },
            ])
          )
        );
        installedEnvRef.current = envKey;
      }
      if (runId !== runIdRef.current) return;

      setStatus("installing");
      const install = await wc.spawn("npm", ["install"]);
      installProcessRef.current = install;
      install.output
        .pipeTo(new WritableStream({ write: (d) => console.log(d) }))
        .catch(() => {});
      const installExit = await install.exit;
      if (runId !== runIdRef.current) return;
      if (installExit !== 0) {
        throw new Error(`npm install failed (exit code ${installExit})`);
      }

      setStatus("starting");
      const dev = await wc.spawn("npm", ["run", "dev"]);
      devProcessRef.current = dev;
      dev.output
        .pipeTo(new WritableStream({ write: (d) => console.log(d) }))
        .catch(() => {});
      dev.exit
        .then((code: number) => {
          if (runId !== runIdRef.current) return;
          if (code !== 0) {
            setError(`Dev server exited with code ${code}`);
            setStatus("error");
          }
        })
        .catch((e: any) => {
          if (runId !== runIdRef.current) return;
          setError(e?.message || "Dev server crashed");
          setStatus("error");
        });
    } catch (e: any) {
      if (runId !== runIdRef.current) return;
      console.error(e);
      setError(e.message || "Failed to start preview");
      setStatus("error");
    }
  }

  useEffect(() => {
    run();
    return () => {
      // Invalidate in-flight runs on unmount
      runIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, activeProjectId]);

  // Sync edited files into the running container
  useEffect(() => {
    if (environment === "html") return;
    if (installedEnvRef.current !== `${activeProjectId}-${environment}`) return;
    if (status !== "ready") return;
    const timer = setTimeout(async () => {
      try {
        const wc = await getWebContainer();
        for (const [path, content] of Object.entries(files)) {
          await wc.fs.writeFile(path, content);
        }
      } catch (e) {
        console.error("[preview sync]", e);
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, status]);

  function fullRestart() {
    killProcesses();
    installedEnvRef.current = null;
    run();
  }

  if (environment === "empty" || Object.keys(files).length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm">Nothing to preview.</p>
        <p className="text-xs mt-1">
          Create files or ask the AI to generate code.
        </p>
      </div>
    );
  }

  if (environment === "html") {
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
          onClick={fullRestart}
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
          onClick={fullRestart}
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
