"use client";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getWebContainer } from "@/lib/webcontainer";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

type Status = "idle" | "booting" | "mounting" | "installing" | "starting" | "ready" | "error";
type KillableProcess = { kill: () => void };

export default function Preview() {
  const { projects, activeProjectId } = useAppStore();
  const project = projects[activeProjectId || ""];
  const files = project?.files || {};
  const environment = project?.environment || "empty";
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const runIdRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const installedEnvRef = useRef<string | null>(null);
  const installProcessRef = useRef<KillableProcess | null>(null);
  const devProcessRef = useRef<KillableProcess | null>(null);
  
  const hasAnyFiles = Object.keys(files).length > 0;
  const isStaticHtml = environment === "html" || (!files["package.json"] && Boolean(files["index.html"]));

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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

  useEffect(() => {
    return () => {
      try { installProcessRef.current?.kill?.(); } catch {}
      try { devProcessRef.current?.kill?.(); } catch {}
      installProcessRef.current = null;
      devProcessRef.current = null;
      runIdRef.current++;
    };
  }, []);

  const escapeForInline = (code: string) =>
    code.replace(/<\/script>/gi, "<\\/script>").replace(/<\/style>/gi, "<\\/style>");

  const buildHtml = () => {
    const html = files["index.html"] || "";
    const css = files["style.css"] || "";
    const js = files["script.js"] || "";
    const safeCss = escapeForInline(css);
    const safeJs = escapeForInline(js);
    return html
      .replace(/<link[^>]*href=["']\.?\/?style\.css["'][^>]*\/?>/i, `<style>${safeCss}</style>`)
      .replace(/<script[^>]*src=["']\.?\/?script\.js["'][^>]*><\/script>/i, `<script>${safeJs}</script>`);
  };

  const killProcesses = () => {
    try { installProcessRef.current?.kill?.(); } catch {}
    try { devProcessRef.current?.kill?.(); } catch {}
    installProcessRef.current = null;
    devProcessRef.current = null;
  };

  async function run() {
    const runId = ++runIdRef.current;
    setError(null);
    setUrl(null);
    killProcesses();
    if (!hasAnyFiles) {
      setStatus("idle");
      return;
    }
    if (isStaticHtml) {
      setStatus("ready");
      return;
    }
    if (!files["package.json"]) {
      setStatus("idle");
      return;
    }
    try {
      const scripts = JSON.parse(files["package.json"]).scripts || {};
      if (!scripts.dev) {
        setError("No 'dev' script found in package.json");
        setStatus("error");
        return;
      }
    } catch {
      setError("Invalid package.json (parse error)");
      setStatus("error");
      return;
    }
    try {
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
      install.output.pipeTo(new WritableStream({ write: (d) => console.log(d) })).catch(() => {});
      const installExit = await install.exit;
      if (runId !== runIdRef.current) return;
      if (installExit !== 0) {
        throw new Error(`npm install failed (exit code ${installExit})`);
      }
      setStatus("starting");
      const dev = await wc.spawn("npm", ["run", "dev"]);
      devProcessRef.current = dev;
      dev.output.pipeTo(new WritableStream({ write: (d) => console.log(d) })).catch(() => {});
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
      runIdRef.current++;
    };
  }, [environment, activeProjectId, hasAnyFiles]);

  useEffect(() => {
    if (isStaticHtml) return;
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
  }, [files, status]);

  function fullRestart() {
    installedEnvRef.current = null;
    run();
  }

  if (!hasAnyFiles) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm">Nothing to preview.</p>
        <p className="text-xs mt-1">Create files or ask the AI to generate code.</p>
      </div>
    );
  }

  if (isStaticHtml) {
    return (
      <div className="h-full w-full bg-white">
        <iframe
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
      <iframe className="w-full h-full border-0" src={url} title="preview" />
    </div>
  );
}
