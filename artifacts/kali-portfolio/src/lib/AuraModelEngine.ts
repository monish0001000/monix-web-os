/**
 * AURA AI — Neural Engine with Groq LPU Hardware Acceleration
 * Primary Engine: Groq (openai/gpt-oss-20b, openai/gpt-oss-120b, qwen/qwen3.8-27b)
 * Secondary Engine: Gemini (Flash & Pro) / Fallback Relay
 */

export type AuraRoutingMode = 'auto' | 'manual';
export type AuraModelId = 'groq-fast' | 'groq-deep' | 'qwen-coder' | 'pollinations';

export interface AuraModelConfig {
  groqKey: string;
  geminiKey: string;
  mode: AuraRoutingMode;
  manualModel: AuraModelId;
}

export interface ModelChoiceResult {
  modelId: AuraModelId;
  modelName: string;
  provider: 'groq' | 'gemini' | 'pollinations';
  apiKey: string;
  badge: string;
  reason: string;
}

export interface AuraGenerateResult {
  text: string;
  modelBadge: string;
  latencyMs: number;
  engineUsed: string;
}

const DEFAULT_GROQ_KEY = "";

const STORAGE_GROQ_KEY = 'monix_aura_groq_key';
const STORAGE_GEMINI_KEY = 'monix_aura_gemini_key';
const STORAGE_MODE = 'monix_aura_routing_mode';
const STORAGE_MANUAL_MODEL = 'monix_aura_manual_model';

export function getAuraConfig(): AuraModelConfig {
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string) || DEFAULT_GROQ_KEY;
  const envGeminiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  const groqKey = localStorage.getItem(STORAGE_GROQ_KEY) || envGroqKey;
  const geminiKey = localStorage.getItem(STORAGE_GEMINI_KEY) || envGeminiKey;
  const mode = (localStorage.getItem(STORAGE_MODE) as AuraRoutingMode) || 'auto';
  const manualModel = (localStorage.getItem(STORAGE_MANUAL_MODEL) as AuraModelId) || 'groq-fast';

  return { groqKey, geminiKey, mode, manualModel };
}

export function saveAuraConfig(config: Partial<AuraModelConfig>) {
  if (config.groqKey !== undefined) localStorage.setItem(STORAGE_GROQ_KEY, config.groqKey);
  if (config.geminiKey !== undefined) localStorage.setItem(STORAGE_GEMINI_KEY, config.geminiKey);
  if (config.mode !== undefined) localStorage.setItem(STORAGE_MODE, config.mode);
  if (config.manualModel !== undefined) localStorage.setItem(STORAGE_MANUAL_MODEL, config.manualModel);
}

/**
 * Intelligent classifier for wise model selection
 */
export function chooseModelWise(
  prompt: string,
  isThinkingMode: boolean,
  config: AuraModelConfig
): ModelChoiceResult {
  const apiKey = config.groqKey || DEFAULT_GROQ_KEY;

  // Manual Mode Override
  if (config.mode === 'manual') {
    if (config.manualModel === 'groq-deep') {
      return {
        modelId: 'groq-deep',
        modelName: 'openai/gpt-oss-120b',
        provider: 'groq',
        apiKey,
        badge: 'Groq 120B (Deep)',
        reason: 'Manual: 120B Deep Reasoning Engine',
      };
    }
    if (config.manualModel === 'qwen-coder') {
      return {
        modelId: 'qwen-coder',
        modelName: 'qwen/qwen3.8-27b',
        provider: 'groq',
        apiKey,
        badge: 'Qwen 3.8 27B',
        reason: 'Manual: Code & Polyglot Engine',
      };
    }
    if (config.manualModel === 'pollinations') {
      return {
        modelId: 'pollinations',
        modelName: 'pollinations-free',
        provider: 'pollinations',
        apiKey: '',
        badge: 'Pollinations AI',
        reason: 'Manual: Public Relay',
      };
    }
    // Default fast
    return {
      modelId: 'groq-fast',
      modelName: 'openai/gpt-oss-20b',
      provider: 'groq',
      apiKey,
      badge: 'Groq 20B (Fast)',
      reason: 'Manual: Ultra-Fast Low Latency Engine',
    };
  }

  // AUTO WISE ROUTER:
  const lower = prompt.toLowerCase();
  const codePatterns = /(code|function|class|def |import |script|algorithm|bug|fix|refactor|sql|payload|cve|exploit|docker|regex|python|javascript|typescript|c\+\+|rust|html|css)/i;
  const reasoningPatterns = /(analyze|explain in depth|architecture|derive|mathematics|compare|contrast|why does|theory|quantum|security audit|vulnerability|step by step|detailed|design)/i;
  const isLengthy = prompt.length > 120;

  const requiresDeepReasoning = isThinkingMode || codePatterns.test(lower) || reasoningPatterns.test(lower) || isLengthy;

  if (requiresDeepReasoning) {
    return {
      modelId: 'groq-deep',
      modelName: 'openai/gpt-oss-120b',
      provider: 'groq',
      apiKey,
      badge: 'Auto: Groq 120B 🧠',
      reason: isThinkingMode
        ? 'Deep Thinking mode active'
        : codePatterns.test(lower)
        ? 'Complex code & logic detected'
        : 'Deep reasoning & analysis requested',
    };
  }

  return {
    modelId: 'groq-fast',
    modelName: 'openai/gpt-oss-20b',
    provider: 'groq',
    apiKey,
    badge: 'Auto: Groq Fast ⚡',
    reason: 'Ultra-low latency conversational command',
  };
}

/**
 * Execute generation via Groq OpenAI-compatible endpoint with automatic fallback
 */
export async function generateAuraResponse(
  userPrompt: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }>,
  systemPrompt: string,
  isThinkingMode: boolean
): Promise<AuraGenerateResult> {
  const config = getAuraConfig();
  const choice = chooseModelWise(userPrompt, isThinkingMode, config);
  const startTime = Date.now();

  const callGroq = async (model: string, key: string) => {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map(h => ({
        role: h.role,
        content: h.text,
      })),
      { role: 'user', content: userPrompt },
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Groq HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from model');
    return content;
  };

  const callPollinations = async () => {
    const fullPrompt = `${systemPrompt}\nUser Query: ${userPrompt}`;
    const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(fullPrompt));
    if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
    return await res.text();
  };

  // 1. Try Primary Groq Model
  if (choice.apiKey && choice.provider === 'groq') {
    try {
      const text = await callGroq(choice.modelName, choice.apiKey);
      const latencyMs = Date.now() - startTime;
      return {
        text,
        modelBadge: choice.badge,
        latencyMs,
        engineUsed: `${choice.modelName} (Groq LPU)`,
      };
    } catch (err: any) {
      console.warn(`[AURA] Primary Groq model ${choice.modelName} failed:`, err?.message);

      // Try alternate fast Groq model
      const fallbackModel = choice.modelName === 'openai/gpt-oss-120b' ? 'openai/gpt-oss-20b' : 'qwen/qwen3.8-27b';
      try {
        const text = await callGroq(fallbackModel, choice.apiKey);
        const latencyMs = Date.now() - startTime;
        return {
          text,
          modelBadge: `Groq Fast ⚡`,
          latencyMs,
          engineUsed: `${fallbackModel} (Groq LPU Failover)`,
        };
      } catch (subErr: any) {
        console.warn(`[AURA] Alternate Groq model failed:`, subErr?.message);
      }
    }
  }

  // 2. Try Pollinations Fallback Relay
  try {
    const text = await callPollinations();
    const latencyMs = Date.now() - startTime;
    return {
      text,
      modelBadge: 'Pollinations AI 🌐',
      latencyMs,
      engineUsed: 'text.pollinations.ai (Free Neural Relay)',
    };
  } catch (relayErr: any) {
    throw new Error('All neural channels offline. Please check your network connectivity or verify API key.');
  }
}

/**
 * Live test Groq API key
 */
export async function testGroqKey(key: string, model: string = 'openai/gpt-oss-20b'): Promise<{ valid: boolean; error?: string; latencyMs?: number }> {
  if (!key.trim()) return { valid: false, error: 'Key is empty' };
  const start = Date.now();
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { valid: false, error: err?.error?.message || `HTTP ${res.status}` };
    }
    return { valid: true, latencyMs: Date.now() - start };
  } catch (e: any) {
    return { valid: false, error: e?.message || 'Network error' };
  }
}

/**
 * Convenience wrapper for other apps (such as Browser AI Companion)
 */
export async function queryAuraEngine(
  prompt: string,
  history: Array<{ role: 'user' | 'assistant'; content?: string; text?: string }> = [],
  options?: {
    model?: string;
    systemPrompt?: string;
    isThinkingMode?: boolean;
  }
): Promise<{ content: string; text: string; modelUsed: string; latencyMs: number }> {
  const normHistory = history.map(h => ({
    role: h.role,
    text: h.text || h.content || '',
  }));
  const res = await generateAuraResponse(
    prompt,
    normHistory,
    options?.systemPrompt || "You are an intelligent AI assistant.",
    options?.isThinkingMode || false
  );
  return {
    content: res.text,
    text: res.text,
    modelUsed: res.engineUsed || res.modelBadge,
    latencyMs: res.latencyMs,
  };
}

