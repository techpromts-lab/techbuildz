const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
let currentKeyIndex = 0;
const exhaustedUntil: Record<string, number> = {};
const COOLDOWN_MS = 60_000;

function getKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(Boolean) as string[];
}

function isExhausted(key: string): boolean {
  const until = exhaustedUntil[key];
  return !!until && Date.now() < until;
}

function markExhausted(key: string) {
  exhaustedUntil[key] = Date.now() + COOLDOWN_MS;
}

function isRateLimitError(status: number, message: string): boolean {
  if (status === 429) return true;
  const lower = message.toLowerCase();
  if (status >= 500 || status === 0) {
    return (
      lower.includes("rate limit") ||
      lower.includes("quota exceeded") ||
      lower.includes("too many requests")
    );
  }
  return false;
}

export async function groqChatCompletion(params: any) {
  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error(
      "No Groq API keys found. Please set GROQ_API_KEY_1 (and optionally _2, _3, _4) in environment variables."
    );
  }

  const modelMap: Record<string, string> = {
    "gpt-oss-120b": "openai/gpt-oss-120b",
    "gpt-oss-20b": "openai/gpt-oss-20b",
    "openai/gpt-oss-120b": "openai/gpt-oss-120b",
    "openai/gpt-oss-20b": "openai/gpt-oss-20b",
  };

  const requestedModel = params.model || "openai/gpt-oss-120b";
  const activeModel = modelMap[requestedModel] || "openai/gpt-oss-120b";
  
  const messages = params.messages.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const payload = {
    model: activeModel,
    messages,
    temperature: params.temperature ?? 0.2,
    max_completion_tokens: params.max_tokens ?? 8192,
    stream: false,
  };

  let lastError: any;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (currentKeyIndex + attempt) % keys.length;
    const apiKey = keys[idx];
    
    if (isExhausted(apiKey)) {
      console.log(`[groq] Key #${idx + 1} cooling down, skipping`);
      continue;
    }

    let res: Response;
    try {
      res = await fetch(GROQ_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (networkErr: any) {
      lastError = networkErr;
      throw new Error(`[groq] Network error: ${networkErr?.message || "unknown"}`);
    }

    if (res.ok) {
      const data = await res.json();
      const replyText = data.choices?.[0]?.message?.content || "";
      currentKeyIndex = (idx + 1) % keys.length;
      console.log(`[groq] Success with key #${idx + 1}`);
      return { choices: [{ message: { content: replyText } }] };
    }

    const err = await res.json().catch(() => ({}));
    const message = err?.error?.message || `Groq API Error (${res.status})`;

    if (isRateLimitError(res.status, message)) {
      console.warn(`[groq] Key #${idx + 1} hit rate limit (status ${res.status}), switching...`);
      markExhausted(apiKey);
      lastError = new Error(message);
      continue;
    }

    throw new Error(message);
  }

  throw new Error(`All ${keys.length} Groq key(s) exhausted rate limits. Last error: ${lastError?.message || "unknown"}`);
}
