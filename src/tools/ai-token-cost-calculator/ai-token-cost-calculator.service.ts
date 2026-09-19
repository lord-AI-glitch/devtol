export interface LlmModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek' | 'Meta / Groq' | 'Mistral';
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cachedInputPricePerMillion?: number;
  contextWindow: number;
  tier: 'flagship' | 'budget' | 'reasoning' | 'code';
  recommendedFor: string;
}

export const LLM_MODELS: LlmModel[] = [
  // Google
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    cachedInputPricePerMillion: 0.025,
    contextWindow: 1048576,
    tier: 'budget',
    recommendedFor: 'Fast multimodal, high throughput, ultra-low cost',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    cachedInputPricePerMillion: 0.3125,
    contextWindow: 2097152,
    tier: 'flagship',
    recommendedFor: 'Massive 2M context analysis, deep reasoning',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    provider: 'Google',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    cachedInputPricePerMillion: 0.02,
    contextWindow: 1048576,
    tier: 'budget',
    recommendedFor: 'Extremely lightweight, cost-sensitive automation',
  },

  // DeepSeek
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.28,
    cachedInputPricePerMillion: 0.014,
    contextWindow: 65536,
    tier: 'budget',
    recommendedFor: 'Exceptional open-weights intelligence at minimum cost',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'DeepSeek',
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    cachedInputPricePerMillion: 0.14,
    contextWindow: 65536,
    tier: 'reasoning',
    recommendedFor: 'Open reasoning & mathematics rivaling OpenAI o1',
  },

  // OpenAI
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    cachedInputPricePerMillion: 1.25,
    contextWindow: 128000,
    tier: 'flagship',
    recommendedFor: 'General flagship intelligence, visual comprehension',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    cachedInputPricePerMillion: 0.075,
    contextWindow: 128000,
    tier: 'budget',
    recommendedFor: 'Everyday lightweight tasks, high-volume classification',
  },
  {
    id: 'o1',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    cachedInputPricePerMillion: 7.50,
    contextWindow: 200000,
    tier: 'reasoning',
    recommendedFor: 'Complex multi-step math, science, and architectural reasoning',
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    inputPricePerMillion: 1.10,
    outputPricePerMillion: 4.40,
    cachedInputPricePerMillion: 0.55,
    contextWindow: 200000,
    tier: 'reasoning',
    recommendedFor: 'STEM reasoning & code generation at high speed',
  },

  // Anthropic
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    cachedInputPricePerMillion: 0.30,
    contextWindow: 200000,
    tier: 'flagship',
    recommendedFor: 'Premier coding, architectural refactoring, natural prose',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    cachedInputPricePerMillion: 0.08,
    contextWindow: 200000,
    tier: 'budget',
    recommendedFor: 'Fast execution, high accuracy text transformations',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    cachedInputPricePerMillion: 1.50,
    contextWindow: 200000,
    tier: 'flagship',
    recommendedFor: 'Nuanced writing, complex analysis, deep synthesis',
  },

  // Meta / Open Source
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'Meta / Groq',
    inputPricePerMillion: 0.59,
    outputPricePerMillion: 0.79,
    contextWindow: 128000,
    tier: 'budget',
    recommendedFor: 'Open-weights production API at extreme Groq speed',
  },

  // Mistral
  {
    id: 'codestral',
    name: 'Codestral 2501',
    provider: 'Mistral',
    inputPricePerMillion: 0.30,
    outputPricePerMillion: 0.90,
    contextWindow: 256000,
    tier: 'code',
    recommendedFor: 'Dedicated code completion, refactoring & Fill-in-the-Middle',
  },
];

export interface TokenEstimationMetrics {
  charCount: number;
  wordCount: number;
  lineCount: number;
  estimatedTokens: number;
  arabicCharRatio: number;
  codeDensityRatio: number;
}

/**
 * Estimates token counts based on realistic Byte-Pair Encoding (BPE) properties.
 * Highlights the difference between standard Latin text (~4 chars/token or 1.3 tokens/word),
 * code/JSON syntax (~3-3.5 chars/token), and Arabic/multilingual scripts (~1.8-2.2 tokens/word).
 */
export function estimateTokens(text: string): TokenEstimationMetrics {
  if (!text || text.length === 0) {
    return {
      charCount: 0,
      wordCount: 0,
      lineCount: 0,
      estimatedTokens: 0,
      arabicCharRatio: 0,
      codeDensityRatio: 0,
    };
  }

  const charCount = text.length;
  const lines = text.split(/\r\n|\r|\n/);
  const lineCount = lines.length;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Arabic unicode range: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const arabicChars = (text.match(arabicRegex) || []).length;
  const arabicRatio = arabicChars / Math.max(charCount, 1);

  // Code / structural indicators: braces, brackets, quotes, indentation, symbols
  const codeChars = (text.match(/[{}()[\];:=<>+*&|^%$#@!/\\]/g) || []).length;
  const codeRatio = codeChars / Math.max(charCount, 1);

  let tokens = 0;

  if (arabicRatio > 0.3) {
    // In standard OpenAI/Anthropic tokenizers, Arabic words typically expand to 1.8 - 2.4 tokens per word
    tokens = Math.ceil(wordCount * 2.1 + (charCount - arabicChars) * 0.25);
  } else if (codeRatio > 0.12 || text.includes('function ') || text.includes('import ') || text.includes('class ')) {
    // Code tokens: punctuation marks are individual tokens, identifier names split on camelCase
    tokens = Math.ceil(charCount / 3.3);
  } else {
    // Standard English prose: ~1.3 tokens per word or ~4 chars per token
    const tokenByWords = Math.ceil(wordCount * 1.33);
    const tokenByChars = Math.ceil(charCount / 4.0);
    tokens = Math.max(tokenByWords, tokenByChars);
  }

  return {
    charCount,
    wordCount,
    lineCount,
    estimatedTokens: Math.max(tokens, 1),
    arabicCharRatio: Math.round(arabicRatio * 100) / 100,
    codeDensityRatio: Math.round(codeRatio * 100) / 100,
  };
}

export interface ModelCostCalculation {
  model: LlmModel;
  inputCost: number;
  outputCost: number;
  singleRequestTotalCost: number;
  monthlyTotalCost: number;
  isCached: boolean;
  savingsVsHighest: number;
}

export interface CalculateCostParams {
  inputTokens: number;
  outputTokens: number;
  requestVolume: number;
  usePromptCache?: boolean;
}

export function calculateLlmCosts(params: CalculateCostParams): ModelCostCalculation[] {
  const { inputTokens, outputTokens, requestVolume, usePromptCache = false } = params;

  const results: ModelCostCalculation[] = LLM_MODELS.map(model => {
    const activeInputRate = (usePromptCache && model.cachedInputPricePerMillion !== undefined)
      ? model.cachedInputPricePerMillion
      : model.inputPricePerMillion;

    const inputCost = (inputTokens / 1_000_000) * activeInputRate;
    const outputCost = (outputTokens / 1_000_000) * model.outputPricePerMillion;
    const singleRequestTotalCost = inputCost + outputCost;
    const monthlyTotalCost = singleRequestTotalCost * requestVolume;

    return {
      model,
      inputCost,
      outputCost,
      singleRequestTotalCost,
      monthlyTotalCost,
      isCached: Boolean(usePromptCache && model.cachedInputPricePerMillion !== undefined),
      savingsVsHighest: 0,
    };
  });

  // Calculate savings vs highest cost model
  const maxMonthlyCost = Math.max(...results.map(r => r.monthlyTotalCost));
  for (const item of results) {
    if (maxMonthlyCost > 0) {
      item.savingsVsHighest = Math.round(((maxMonthlyCost - item.monthlyTotalCost) / maxMonthlyCost) * 100);
    }
  }

  return results.sort((a, b) => a.singleRequestTotalCost - b.singleRequestTotalCost);
}

export const SAMPLE_PROMPTS = [
  {
    name: 'Customer Support Assistant',
    description: 'Typical support classification and response prompt',
    systemPrompt: 'You are an expert customer success assistant for an e-commerce platform. Be polite, concise, and prioritize customer resolution.',
    userPrompt: 'Hello, my package order #48291 was marked as delivered yesterday, but I checked my front porch and mail locker and it has not arrived yet. Can you please assist me with a refund or replacement as soon as possible?',
    expectedOutputTokens: 250,
  },
  {
    name: 'Senior Code Review & Refactoring',
    description: 'Large prompt with code analysis and refactor suggestions',
    systemPrompt: 'You are a Principal Staff Software Engineer specializing in high-performance TypeScript, Vue 3, and memory optimization.',
    userPrompt: `Review this function and optimize it for zero allocation and O(n) complexity:
export function processRawTransactions(data: any[]) {
  return data
    .filter(item => item.status === 'completed' && item.amount > 0)
    .map(item => ({ id: item.id, total: item.amount * 1.14, date: new Date(item.timestamp) }))
    .sort((a, b) => b.total - a.total);
}`,
    expectedOutputTokens: 600,
  },
  {
    name: 'Arabic Document Summarizer',
    description: 'Demonstrates Arabic token density in BPE tokenizers',
    systemPrompt: 'أنت مساعد ذكاء اصطناعي خبير في التحليل القانوني وصياغة العقود التجارية باللغة العربية الفصحى.',
    userPrompt: 'يرجى قراءة بنود اتفاقية عدم الإفصاح وحماية الملكية الفكرية المرفقة، واستخراج كافة الالتزامات الجوهرية المفروضة على الطرف المتلقي للمعلومات السرية، مع بيان مدد التقادم والشروط الجزائية ومحاكم الاختصاص المعتمدة لفض النزاعات التجارية بين الطرفين.',
    expectedOutputTokens: 500,
  },
  {
    name: 'RAG Retrieval Context Injection',
    description: 'High input tokens with context embeddings & short answer',
    systemPrompt: 'Answer the user question strictly using the provided search context. If not mentioned in the context, reply that information is unavailable.',
    userPrompt: `[DOCUMENTATION CHUNK #1]
DevTol is a privacy-first web utilities platform with 126+ developer tools. All tools execute entirely client-side inside the user browser.

[DOCUMENTATION CHUNK #2]
DevTol supports 10 global languages including Arabic, English, Spanish, French, German, and Chinese.

[QUESTION]
Does DevTol send uploaded files to any cloud server for processing?`,
    expectedOutputTokens: 150,
  },
];
