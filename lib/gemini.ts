let currentKeyIndex = 0;

function getKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
}

function getNextKey(keys: string[]): string {
  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys found. Please set GEMINI_API_KEY_1 in your environment variables."
    );
  }
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

export async function geminiChatCompletion(params: any) {
  const keys = getKeys();
  const maxRetries = keys.length || 1;
  let lastError: any;

  let requestedModel = params.model || "gemini-2.5-flash";
  if (requestedModel.startsWith("models/")) {
    requestedModel = requestedModel.replace("models/", "");
  }

  // Legacy model remapping (typo gemini-3.8-flash removed — did not exist)
  const modelMap: Record<string, string> = {
    "gemini-1.5-flash": "gemini-2.5-flash",
    "gemini-1.5-pro": "gemini-2.5-pro",
    "gemini-2.0-flash-exp": "gemini-2.5-flash",
    "gemini-1.5-flash-8b": "gemini-2.5-flash-lite",
  };

  const activeModel = modelMap[requestedModel] || requestedModel;

  const systemMsg =
    params.messages.find((m: any) => m.role === "system")?.content || "";
  const chatMessages = params.messages.filter((m: any) => m.role !== "system");
  const contents = chatMessages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const payload = {
    contents,
    systemInstruction: systemMsg
      ? { parts: [{ text: systemMsg }] }
      : undefined,
    generationConfig: {
      temperature: params.temperature ?? 0.2,
      maxOutputTokens: params.max_tokens ?? 8192,
    },
  };

  for (let i = 0; i < maxRetries; i++) {
    const apiKey = getNextKey(keys);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const isRateLimit =
          res.status === 429 ||
          err?.error?.message?.toLowerCase()?.includes("quota") ||
          err?.error?.message?.toLowerCase()?.includes("rate limit");

        if (isRateLimit && keys.length > 1) {
          console.warn("Gemini key hit limit, switching to next key...");
          lastError = new Error(err.error?.message || "Rate limit exceeded");
          continue;
        }
        throw new Error(
          err.error?.message || `Gemini API Error (${res.status})`
        );
      }

      const data = await res.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return { choices: [{ message: { content: replyText } }] };
    } catch (error: any) {
      lastError = error;
      // Only retry on rate limit; rethrow other errors immediately
      if (!error.message?.includes("Rate limit")) throw error;
    }
  }

  throw lastError;
}
