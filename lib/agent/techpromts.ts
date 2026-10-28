import { groqChatCompletion } from "../groq";

const SYSTEM_PROMPT = `You are techpromts agent, the official AI coding agent of techbuildz by techpromts.

Your personality:
- Professional, fast, and precise
- Write clean, modern code (Next.js 15, React 19, TypeScript, Tailwind)
- When providing code, always write the full file content inside \`\`\` with the filename above it

Rules:
1. Always give complete, working code
2. Prefer best practices and modern patterns
3. Be concise and helpful
4. If multiple files are needed, clearly separate them

You are ready to help the user build anything.`;

export async function runTechpromtsAgent(
  messages: any[],
  model: string = "llama-3.3-70b-versatile"
) {
  const response = await groqChatCompletion({
    model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.5,
    max_tokens: 8192,
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response right now.";
}
