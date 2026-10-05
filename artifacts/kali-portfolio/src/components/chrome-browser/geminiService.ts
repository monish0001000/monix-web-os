import { GoogleGenAI } from "@google/genai";
import { queryAuraEngine } from "@/lib/AuraModelEngine";

export interface ChatOptions {
  useSearch?: boolean;
  useMaps?: boolean;
  useUrlContext?: boolean;
  currentUrl?: string;
  image?: {
    data: string;
    mimeType: string;
  };
}

export async function generateChatResponse(
  prompt: string,
  history: { role: 'user' | 'model', text: string }[],
  options: ChatOptions
) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_KEY_1 || "";

  // 1. If Gemini API key is configured, use Google GenAI
  if (geminiKey && geminiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      let modelName = "gemini-2.0-flash";
      const tools: any[] = [];

      if (options.useSearch) {
        tools.push({ googleSearch: {} });
      }

      const parts: any[] = [];
      if (options.image) {
        const base64Data = options.image.data.includes(',')
          ? options.image.data.split(',')[1]
          : options.image.data;
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: options.image.mimeType
          }
        });
      }

      let finalPrompt = prompt;
      if (options.useUrlContext && options.currentUrl) {
        finalPrompt = `Context URL: ${options.currentUrl}\n\n${prompt}`;
      }
      parts.push({ text: finalPrompt });

      const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts });

      const config: any = {};
      if (tools.length > 0) config.tools = tools;

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config
      });

      return {
        text: response.text || "No response received.",
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };
    } catch (err) {
      console.warn("[Chrome AI] Gemini request failed, falling back to Monix Groq Engine:", err);
    }
  }

  // 2. High-speed Fallback: Groq LPU via AuraModelEngine
  try {
    const formattedHistory = history.map(msg => ({
      role: (msg.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: msg.text
    }));

    let fullPrompt = prompt;
    if (options.useUrlContext && options.currentUrl) {
      fullPrompt = `[Webpage Context: ${options.currentUrl}]\n\n${prompt}`;
    }

    const res = await queryAuraEngine(fullPrompt, formattedHistory, {
      model: 'auto',
      systemPrompt: "You are the Monix Web-OS intelligent browser companion. Assist the user with webpage analysis, code explanation, summarizing articles, and answering questions cleanly and concisely with Markdown formatting."
    });

    return {
      text: res.content,
      modelUsed: res.modelUsed,
      latencyMs: res.latencyMs
    };
  } catch (groqErr: any) {
    console.error("[Chrome AI] Groq fallback error:", groqErr);
    return {
      text: `Error contacting neural engine: ${groqErr?.message || "Check network connectivity."}`
    };
  }
}
