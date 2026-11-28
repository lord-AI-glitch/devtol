import { describe, expect, it } from 'vitest';
import {
  LLM_MODELS,
  calculateLlmCosts,
  estimateTokens,
} from './ai-token-cost-calculator.service';

describe('ai-token-cost-calculator.service', () => {
  it('returns zeros for empty or null text', () => {
    const result = estimateTokens('');
    expect(result.charCount).toBe(0);
    expect(result.wordCount).toBe(0);
    expect(result.estimatedTokens).toBe(0);
  });

  it('estimates English text tokens accurately', () => {
    const text = 'Build high-performance developer tools for modern web engineers.';
    const result = estimateTokens(text);
    expect(result.charCount).toBe(text.length);
    expect(result.wordCount).toBe(8);
    expect(result.estimatedTokens).toBeGreaterThanOrEqual(10);
    expect(result.estimatedTokens).toBeLessThanOrEqual(25);
    expect(result.arabicCharRatio).toBe(0);
  });

  it('detects Arabic text and models higher BPE token expansion ratio', () => {
    const arabicText = 'مرحبا بكم في منصة ديف تول لأدوات المطورين والمصممين.';
    const result = estimateTokens(arabicText);
    expect(result.arabicCharRatio).toBeGreaterThan(0.5);
    // Arabic words in BPE typically expand to > 1.8 tokens/word
    expect(result.estimatedTokens).toBeGreaterThan(result.wordCount * 1.5);
  });

  it('detects code tokens and handles structural punctuation', () => {
    const codeSnippet = 'const total = data.map(x => ({ id: x.id, val: x.val * 2 })).filter(Boolean);';
    const result = estimateTokens(codeSnippet);
    expect(result.codeDensityRatio).toBeGreaterThan(0.1);
    expect(result.estimatedTokens).toBeGreaterThan(0);
  });

  it('calculates model costs accurately per request and at monthly scale', () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const requestVolume = 10000;

    const costs = calculateLlmCosts({
      inputTokens,
      outputTokens,
      requestVolume,
      usePromptCache: false,
    });

    expect(costs.length).toBe(LLM_MODELS.length);

    // DeepSeek-V3 or Gemini 2.0 Flash should be among the cheapest
    const cheapest = costs[0];
    const mostExpensive = costs[costs.length - 1];

    expect(cheapest.singleRequestTotalCost).toBeLessThan(mostExpensive.singleRequestTotalCost);
    expect(cheapest.monthlyTotalCost).toBe(cheapest.singleRequestTotalCost * requestVolume);
    expect(cheapest.savingsVsHighest).toBeGreaterThan(50);
  });

  it('applies prompt caching discounts when enabled', () => {
    const inputTokens = 100000;
    const outputTokens = 1000;
    const requestVolume = 100;

    const uncached = calculateLlmCosts({
      inputTokens,
      outputTokens,
      requestVolume,
      usePromptCache: false,
    });

    const cached = calculateLlmCosts({
      inputTokens,
      outputTokens,
      requestVolume,
      usePromptCache: true,
    });

    const sonnetUncached = uncached.find(c => c.model.id === 'claude-sonnet-4-5')!;
    const sonnetCached = cached.find(c => c.model.id === 'claude-sonnet-4-5')!;

    // Claude Sonnet 4.5 input is $3.00 uncached vs $0.30 cached (90% cache discount)
    expect(sonnetCached.inputCost).toBeLessThan(sonnetUncached.inputCost);
    expect(sonnetCached.isCached).toBe(true);
  });
});
