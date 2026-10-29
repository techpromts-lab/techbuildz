import { NextRequest, NextResponse } from "next/server";
import { runTechpromtsAgent } from "@/lib/agent/techpromts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }
    const reply = await runTechpromtsAgent(messages, model);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[Agent API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
