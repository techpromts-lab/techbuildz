// lib/groq.ts

const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

// Tracks which key to start with next request (advanced only on success)
let currentKeyIndex = 0;

// Tracks keys that hit rate limit (cooldown for 60s)
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

export async function groqChatCompletion(params: any) {
  const keys = getKeys();

  if (keys.length === 0) {
    throw new Error(
      "No Groq API keys found. Please set GROQ_API_KEY_1 (and optionally _2, _3, _4) in environment variables."
    );
  }

  // Model mapping - accepts both short and full names
  const modelMap: Record<string, string> = {
    "gpt-oss-120b": "openai/gpt-oss-120b",
    "gpt-oss-20b": "openai/gpt-oss-20b",
    "openai/gpt-oss-120b": "openai/gpt-oss-120b",
    "openai/gpt-oss-20b": "openai/gpt-oss-20b",
  };

  const requestedModel = params.model || "openai/gpt-oss-120b";
  const activeModel = modelMap[requestedModel] || "openai/gpt-oss-120b";

  // Groq is OpenAI-compatible (including system role)
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

  // Try each key exactly once, starting from current index (Round-Robin)
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (currentKeyIndex + attempt) % keys.length;
    const apiKey = keys[idx];

    // Skip keys that are cooling down
    if (isExhausted(apiKey)) {
      console.log(`[groq] Key #${idx + 1} cooling down, skipping`);
      continue;
    }

    try {
      const res = await fetch(GROQ_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      // Success
      if (res.ok) {
        const data = await res.json();
        const replyText = data.choices?.[0]?.message?.content || "";

        // Advance index for next request (even load distribution)
        currentKeyIndex = (idx + 1) % keys.length;

        console.log(`[groq] Success with key #${idx + 1}`);
        return { choices: [{ message: { content: replyText } }] };
      }

      // Failure - inspect error type
      const err = await res.json().catch(() => ({}));
      const message = err?.error?.message || `Groq API Error (${res.status})`;
      const lower = message.toLowerCase();

      const isRateLimit =
        res.status === 429 ||
        lower.includes("rate limit") ||
        lower.includes("quota") ||
        lower.includes("too many requests");

      if (isRateLimit) {
        console.warn(
          `[groq] Key #${idx + 1} hit rate limit, switching to next...`
        );
        markExhausted(apiKey);
        lastError = new Error(message);
        continue; // try next key
      }

      // Non-retryable error (auth, model not found, invalid request...)
      throw new Error(message);
    } catch (error: any) {
      lastError = error;
      const msg = (error?.message || "").toLowerCase();

      // Only continue if it was a rate limit error
      if (
        msg.includes("rate limit") ||
        msg.includes("quota") ||
        msg.includes("too many requests")
      ) {
        markExhausted(apiKey);
        continue;
      }

      // Any other error - throw immediately
      throw error;
    }
  }

  // All keys exhausted or cooling down
  throw new Error(
    `All ${keys.length} Groq key(s) exhausted rate limits. Last error: ${
      lastError?.message || "unknown"
    }`
  );
}
