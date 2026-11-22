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
  // OpenAI
  {
    id: 'gpt-6-1-sol',
    name: 'GPT-6.1 Sol',
    provider: 'OpenAI',
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 10.00,
    cachedInputPricePerMillion: 0.10,
    contextWindow: 1050000,
    tier: 'flagship',
    recommendedFor: 'Near-Astra coding, agentic work and computer use at a lower cost',
  },
  {
    id: 'gpt-6-1-terra',
    name: 'GPT-6.1 Terra',
    provider: 'OpenAI',
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 5.00,
    cachedInputPricePerMillion: 0.05,
    contextWindow: 1050000,
    tier: 'budget',
    recommendedFor: 'Fast visual reasoning, computer use and clear writing',
  },
  {
    id: 'gpt-6-luna',
    name: 'GPT-6 Luna',
    provider: 'OpenAI',
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.50,
    cachedInputPricePerMillion: 0.01,
    contextWindow: 1050000,
    tier: 'budget',
    recommendedFor: 'Cost-sensitive high-volume classification, routing and extraction',
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 10.00,
    cachedInputPricePerMillion: 0.125,
    contextWindow: 400000,
    tier: 'reasoning',
    recommendedFor: 'Flagship reasoning — retires Dec 11, 2026, replaced by GPT-6.1 Sol',
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 mini',
    provider: 'OpenAI',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 2.00,
    cachedInputPricePerMillion: 0.025,
    contextWindow: 400000,
    tier: 'budget',
    recommendedFor: 'High-volume general work — retires Dec 11, 2026, replaced by GPT-6.1 Terra',
  },
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

  // Anthropic
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    cachedInputPricePerMillion: 0.30,
    contextWindow: 200000,
    tier: 'flagship',
    recommendedFor: 'Premier coding, architectural refactoring, natural prose',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 5.00,
    cachedInputPricePerMillion: 0.10,
    contextWindow: 200000,
    tier: 'budget',
    recommendedFor: 'Fast execution, high accuracy text transformations',
  },

  // Google
  {
    id: 'gemini-3-1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 12.00,
    cachedInputPricePerMillion: 0.20,
    contextWindow: 1048576,
    tier: 'flagship',
    recommendedFor: 'Multimodal understanding, agentic work (rates for prompts up to 200K tokens)',
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 3.00,
    cachedInputPricePerMillion: 0.05,
    contextWindow: 1000000,
    tier: 'budget',
    recommendedFor: 'Fast, capable production default',
  },

  // DeepSeek
  {
    id: 'deepseek-flash',
    name: 'DeepSeek Flash',
    provider: 'DeepSeek',
    inputPricePerMillion: 0.30,
    outputPricePerMillion: 1.20,
    cachedInputPricePerMillion: 0.006,
    contextWindow: 1000000,
    tier: 'budget',
    recommendedFor: 'Unified chat + reasoning at minimum cost (peak rate; off-peak 50% lower)',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    inputPricePerMillion: 1.32,
    outputPricePerMillion: 3.96,
    cachedInputPricePerMillion: 0.044,
    contextWindow: 1000000,
    tier: 'flagship',
    recommendedFor: 'DeepSeek flagship for complex coding and analysis (peak rate; off-peak 50% lower)',
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
    name: 'Codestral',
    provider: 'Mistral',
    inputPricePerMillion: 0.30,
    outputPricePerMillion: 0.90,
    cachedInputPricePerMillion: 0.03,
    contextWindow: 256000,
    tier: 'code',
    recommendedFor: 'Dedicated code completion, refactoring & Fill-in-the-Middle',
  },
];

// Prices verified against the providers' official pricing pages on 2026-11-22.
// Retired models (OpenAI o1 / o3-mini, Claude 3.5 Sonnet / Haiku / 3 Opus,
// Gemini 1.5 Pro / 2.0 Flash / 2.0 Flash-Lite, DeepSeek V3 / R1 / V3.2,
// Codestral 2501) were removed because they no longer appear on those pages.
// Claude Opus 4.1 was removed too: retired from the first-party Anthropic API
// on Aug 5, 2026 (still billable via Amazon Bedrock / Google Cloud, $15/$75).
export const PRICING_LAST_UPDATED = '2026-11-22';

export const PRICING_SOURCES: Record<LlmModel['provider'], string> = {
  OpenAI: 'https://platform.openai.com/docs/pricing',
  Anthropic: 'https://docs.anthropic.com/en/docs/about-claude/pricing',
  Google: 'https://ai.google.dev/gemini-api/docs/pricing',
  DeepSeek: 'https://api-docs.deepseek.com/quick_start/pricing',
  'Meta / Groq': 'https://groq.com/pricing',
  Mistral: 'https://mistral.ai/pricing',
};

export const PRICING_DISCLAIMER = 'Prices are approximate and may change — check the provider\u2019s official pricing page before making a decision. GPT-5 and GPT-5 mini retire on Dec 11, 2026 (OpenAI deprecation schedule); GPT-6.1 Sol and Terra are their replacements. Gemini 3.1 Pro rates apply to prompts up to 200K tokens; GPT-6.1 rates apply to prompts up to 272K tokens. DeepSeek rates shown are peak cache-miss rates — off-peak rates are 50% lower.';

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
DevTol is a privacy-first web utilities platform with 122 developer tools. All tools execute entirely client-side inside the user browser.

[DOCUMENTATION CHUNK #2]
DevTol supports 10 global languages including Arabic, English, Spanish, French, German, and Chinese.

[QUESTION]
Does DevTol send uploaded files to any cloud server for processing?`,
    expectedOutputTokens: 150,
  },
];
