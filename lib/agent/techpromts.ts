import { groqChatCompletion } from "../groq";

const SYSTEM_PROMPT = `أنت techpromts agent، الوكيل الرسمي لمنصة techbuildz by techpromts.
تكتب كود نظيف واحترافي (Next.js 15, React, TypeScript, Tailwind).
لما تعطي كود، اكتبه كامل داخل \`\`\` مع اسم الملف.`;

export async function runTechpromtsAgent(messages: any[], model = "llama-3.3-70b-versatile") {
  const response = await groqChatCompletion({
    model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.5,
    max_tokens: 8192,
  });
  return response.choices[0]?.message?.content || "ما قدرت أرد.";
}
