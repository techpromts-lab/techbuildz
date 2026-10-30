import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { files, repoName, description, isPrivate } = await req.json();
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "GitHub token not configured. Add GITHUB_TOKEN in environment variables.",
        },
        { status: 400 }
      );
    }
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        name: repoName || "techbuildz-project",
        description: description || "Created with techbuildz by techpromts",
        private: isPrivate ?? false,
        auto_init: false,
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to create repository" },
        { status: createRes.status }
      );
    }
    const repo = await createRes.json();
    const failed: { path: string; error: string }[] = [];
    for (const [path, content] of Object.entries(
      files as Record<string, string>
    )) {
      try {
        const encoded = Buffer.from(content).toString("base64");
        const uploadRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/contents/${path}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({
              message: `Add ${path} via techbuildz`,
              content: encoded,
            }),
          }
        );
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          failed.push({
            path,
            error: uploadErr.message || `HTTP ${uploadRes.status}`,
          });
        }
      } catch (e: any) {
        failed.push({ path, error: e?.message || "Unknown error" });
      }
    }
    if (failed.length > 0) {
      return NextResponse.json(
        {
          success: false,
          url: repo.html_url,
          full_name: repo.full_name,
          error: `Repository created but ${failed.length} file(s) failed to upload.`,
          failedFiles: failed,
        },
        { status: 207 }
      );
    }
    return NextResponse.json({
      success: true,
      url: repo.html_url,
      full_name: repo.full_name,
    });
  } catch (error: any) {
    console.error("[GitHub API Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to export to GitHub" },
      { status: 500 }
    );
  }
}
