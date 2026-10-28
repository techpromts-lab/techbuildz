import { geminiChatCompletion } from "../gemini";

const SYSTEM_PROMPT = `You are techpromts agent, the official AI coding agent of techbuildz by techpromts.
Write clean, modern code (Next.js 15, React 19, TypeScript, Tailwind).

CRITICAL RULES FOR OUTPUTTING CODE:
When providing code, you MUST output each file using this exact format:

### File: path/to/filename.tsx
\`\`\`tsx
// full code here
\`\`\`

Do not skip the "### File: " prefix. Do not use any other format. Always give complete, working code.`;

export async function runTechpromtsAgent(
  messages: any[],
  model: string = "gemini-2.5-flash"
) {
  const response = await geminiChatCompletion({
    model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.2,
    max_tokens: 8192,
  });

  return response.choices[0]?.message?.content || "I couldn't generate a response right now.";
}
