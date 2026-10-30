// lib/groq.ts

const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

let currentKeyIndex = 0;

function getKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(Boolean) as string[];
}

function getNextKey(keys: string[]): string {
  if (keys.length === 0) {
    throw new Error(
      "No Groq API keys found. Please set GROQ_API_KEY_1 in your environment variables."
    );
  }
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

export async function groqChatCompletion(params: any) {
  const keys = getKeys();
  const maxRetries = keys.length || 1;
  let lastError: any;

  // Groq model IDs
  const modelMap: Record<string, string> = {
    "gpt-oss-120b": "openai/gpt-oss-120b",
    "gpt-oss-20b": "openai/gpt-oss-20b",
    "openai/gpt-oss-120b": "openai/gpt-oss-120b",
    "openai/gpt-oss-20b": "openai/gpt-oss-20b",
  };

  const requestedModel = params.model || "openai/gpt-oss-120b";
  const activeModel = modelMap[requestedModel] || "openai/gpt-oss-120b";

  // Groq uses OpenAI-compatible messages (including system role)
  const messages = params.messages.map((m: any) => ({
    role: m.role === "system" ? "system" : m.role,
    content: m.content,
  }));

  const payload: any = {
    model: activeModel,
    messages,
    temperature: params.temperature ?? 0.2,
    max_completion_tokens: params.max_tokens ?? 8192,
    stream: false,
  };

  for (let i = 0; i < maxRetries; i++) {
    const apiKey = getNextKey(keys);
    try {
      const res = await fetch(GROQ_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const isRateLimit =
          res.status === 429 ||
          err?.error?.message?.toLowerCase()?.includes("rate limit") ||
          err?.error?.message?.toLowerCase()?.includes("quota");

        if (isRateLimit && keys.length > 1) {
          console.warn("Groq key hit limit, switching to next key...");
          lastError = new Error(err.error?.message || "Rate limit exceeded");
          continue;
        }
        throw new Error(
          err.error?.message || `Groq API Error (${res.status})`
        );
      }

      const data = await res.json();
      const replyText = data.choices?.[0]?.message?.content || "";

      return { choices: [{ message: { content: replyText } }] };
    } catch (error: any) {
      lastError = error;
      if (
        !error.message?.includes("Rate limit") &&
        !error.message?.includes("rate limit")
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}
