import { WebContainer } from "@webcontainer/api";

let bootPromise: Promise<WebContainer> | null = null;

export async function getWebContainer() {
  if (!bootPromise) {
    // تخزين الـ Promise يمنع أي استدعاء متزامن آخر من تشغيل الأداة مرة أخرى
    bootPromise = WebContainer.boot({ coep: "require-corp" });
  }
  return bootPromise;
}
