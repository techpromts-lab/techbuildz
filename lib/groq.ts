import Groq from "groq-sdk";

const keys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getNextKey(): string {
  if (keys.length === 0) throw new Error("No Groq API keys found");
  const key = keys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

export function createGroqClient() {
  return new Groq({ apiKey: getNextKey() });
}

export async function groqChatCompletion(params: any, maxRetries = keys.length || 1) {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    const client = createGroqClient();
    try {
      return await client.chat.completions.create({ ...params, stream: false });
    } catch (error: any) {
      lastError = error;
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.toLowerCase()?.includes("rate limit") ||
        error?.message?.toLowerCase()?.includes("quota");

      if (isRateLimit) {
        console.warn("Key hit limit, switching...");
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
