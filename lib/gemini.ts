const keys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getNextKey(): string {
  if (keys.length === 0) throw new Error("No Gemini API keys found");
  const key = keys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

export async function geminiChatCompletion(params: any, maxRetries = keys.length || 1) {
  let lastError: any;

  // تحويل الرسائل لتناسب صيغة جوجل
  const systemMsg = params.messages.find((m: any) => m.role === "system")?.content || "";
  const chatMessages = params.messages.filter((m: any) => m.role !== "system");

  const contents = chatMessages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemMsg }]
    },
    generationConfig: {
      temperature: params.temperature || 0.2,
      maxOutputTokens: params.max_tokens || 8192,
    }
  };

  for (let i = 0; i < maxRetries; i++) {
    const apiKey = getNextKey();
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        const isRateLimit = res.status === 429 || err?.error?.message?.toLowerCase()?.includes("quota") || err?.error?.message?.toLowerCase()?.includes("rate limit");
        
        if (isRateLimit) {
          console.warn("Gemini key hit limit, switching...");
          lastError = new Error("Rate limit exceeded");
          continue;
        }
        throw new Error(err.error?.message || "Gemini API Error");
      }

      const data = await res.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // إرجاع النتيجة بنفس شكل Groq عشان الكود التاني ميبوظش
      return {
        choices: [{ message: { content: replyText } }]
      };
    } catch (error: any) {
      lastError = error;
      // لو الخطأ مش rate limit، نرميه فوراً
      if (error.message !== "Rate limit exceeded") throw error;
    }
  }
  throw lastError;
}
