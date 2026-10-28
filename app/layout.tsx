import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "techbuildz by techpromts",
  description: "Vibe coding platform powered by AI — techpromts agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
