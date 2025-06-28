import React, { useState } from "react";
import { FILLERS } from "./fillers";
import { REDUNDANT_PHRASES } from "./redundant.phase";
import { ACTION_VERBS } from "./actions.verbs";
import { PERSONAL_PRONOUNS } from "./personalPronouns";
import { WEAK_VERBS } from "./weak.verb";
import type { TokenizationMethod } from "../@types/type/tokenizationMethod.types";
import type { TokenAnalysis } from "../@types/interface/tokenAnalysis.interface";
import type { OptimizationResult } from "../@types/interface/optimizationResult.interface";
import type { OptimizationStats } from "../@types/interface/optimization.interface";
import { isLikelyCode } from "./isLikelyCode";
import { maskSecrets } from "./maskSecrets";
// Enhanced code detection with more patterns

// Enhanced secret masking with more patterns

// Remove redundant phrases with case insensitive matching
const removeRedundantPhrases = (text: string): string => {
  let result = text;
  for (const [verbose, concise] of REDUNDANT_PHRASES) {
    const regex = new RegExp(
      verbose.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    result = result.replace(regex, concise);
  }
  return result.replace(/\s+/g, " ").trim();
};

// Smart sentence reconstruction with better flow
const reconstructSentence = (tokens: string[]): string => {
  if (tokens.length === 0) return "";

  // Prioritize action verbs at the beginning
  const actionVerbIndex = tokens.findIndex((token) =>
    ACTION_VERBS.includes(token.toLowerCase())
  );

  if (actionVerbIndex > 0) {
    const actionVerb = tokens[actionVerbIndex];
    const remaining = [
      ...tokens.slice(0, actionVerbIndex),
      ...tokens.slice(actionVerbIndex + 1),
    ];
    tokens = [actionVerb, ...remaining];
  }

  return tokens.join(" ");
};

// Advanced tokenization with improved context awareness
const smartTokenize = (text: string): string[] => {
  text = removeRedundantPhrases(text);

  // Split into sentences first for better context
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  const optimizedSentences: string[] = [];

  for (let sentence of sentences) {
    const words = sentence.toLowerCase().match(/\b[\w']+\b/g) || [];
    const tokens: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i + 1];
      // const prevWord = words[i - 1];

      // Skip fillers and personal pronouns (with exceptions)
      if (FILLERS.has(word) || PERSONAL_PRONOUNS.has(word)) {
        // Keep personal pronouns if they're subjects of action verbs
        if (
          PERSONAL_PRONOUNS.has(word) &&
          nextWord &&
          ACTION_VERBS.includes(nextWord)
        ) {
          tokens.push(word);
        }
        continue;
      }

      // Skip common articles and prepositions unless contextually important
      if (
        [
          "the",
          "a",
          "an",
          "and",
          "or",
          "but",
          "in",
          "on",
          "at",
          "to",
          "for",
          "of",
          "with",
          "by",
        ].includes(word)
      ) {
        if (nextWord && ACTION_VERBS.includes(nextWord)) continue;
        if (
          ["in", "on", "at", "to", "for", "with", "by"].includes(word) &&
          nextWord
        ) {
          tokens.push(word); // Keep prepositions with objects
        }
        continue;
      }

      // Replace weak verbs with strong alternatives
      const strongVerb = WEAK_VERBS[word];
      tokens.push(strongVerb || word);
    }

    if (tokens.length > 0) {
      optimizedSentences.push(reconstructSentence(tokens));
    }
  }

  return optimizedSentences;
};

// Remove consecutive duplicates and clean up
const collapseRedundancy = (sentences: string[]): string[] => {
  return sentences
    .filter((sentence) => sentence.length > 2)
    .map((sentence) => {
      // Remove word-level duplicates within sentence
      const words = sentence.split(" ");
      const unique: string[] = [];
      let prev = "";

      for (const word of words) {
        if (word !== prev || ACTION_VERBS.includes(word.toLowerCase())) {
          unique.push(word);
        }
        prev = word;
      }

      return unique.join(" ");
    })
    .filter((sentence) => sentence.length > 0);
};

// Advanced tokenization methods
const TokenizationMethods: Record<
  TokenizationMethod,
  (text: string) => string[]
> = {
  // Simple word-based tokenization
  WORD: (text: string) => text.match(/\b\w+\b/g) || [],

  // GPT-style tokenization (approximation)
  GPT_APPROX: (text: string) => {
    // Approximate GPT tokenization: ~4 chars per token on average
    // This is a simplified approximation for demonstration
    const chunks: string[] = [];
    let current = "";

    for (let i = 0; i < text.length; i++) {
      current += text[i];

      // Break on whitespace or punctuation boundaries
      if (
        /\s/.test(text[i]) ||
        /[.,!?;:]/.test(text[i]) ||
        current.length >= 4
      ) {
        if (current.trim()) chunks.push(current.trim());
        current = "";
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  },

  // Character-based tokenization
  CHARACTER: (text: string) => text.split(""),

  // Sentence-based tokenization
  SENTENCE: (text: string) => text.split(/[.!?]+/).filter((s) => s.trim()),

  // Subword tokenization (simplified BPE-like)
  SUBWORD: (text: string) => {
    const words = text.match(/\b\w+\b/g) || [];
    const subwords: string[] = [];

    for (const word of words) {
      if (word.length <= 4) {
        subwords.push(word);
      } else {
        // Split longer words into subwords
        for (let i = 0; i < word.length; i += 3) {
          subwords.push(word.slice(i, i + 3));
        }
      }
    }
    return subwords;
  },
};

// Safe tokenization with error handling
const safeTokenize = (
  text: string,
  method: TokenizationMethod = "WORD"
): string[] => {
  try {
    if (!text || typeof text !== "string") return [];

    // Sanitize text to prevent injection attacks
    const sanitized = text
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim();

    const tokenizer = TokenizationMethods[method];
    if (!tokenizer) throw new Error(`Unknown tokenization method: ${method}`);

    return tokenizer(sanitized);
  } catch (error) {
    console.warn("Tokenization error:", error);
    return text.split(/\s+/).filter((t) => t.length > 0);
  }
};

// Comprehensive token analysis
const analyzeTokens = (
  originalText: string,
  optimizedText: string
): Record<string, TokenAnalysis> => {
  const methods: TokenizationMethod[] = [
    "WORD",
    "GPT_APPROX",
    "CHARACTER",
    "SENTENCE",
    "SUBWORD",
  ];
  const analysis: Record<string, TokenAnalysis> = {};

  for (const method of methods) {
    const originalTokens = safeTokenize(originalText, method);
    const optimizedTokens = safeTokenize(optimizedText, method);

    analysis[method] = {
      original: originalTokens.length,
      optimized: optimizedTokens.length,
      reduction:
        originalTokens.length > 0
          ? Math.round(
              ((originalTokens.length - optimizedTokens.length) /
                originalTokens.length) *
                100
            )
          : 0,
      tokens: {
        original: originalTokens,
        optimized: optimizedTokens,
      },
    };
  }

  return analysis;
};

// Main optimization function with comprehensive token analysis
const superOptimizePrompt = (rawInput: string): OptimizationResult => {
  const lines = rawInput.split("\n");
  const output: string[] = [];
  let originalWords = 0;
  let optimizedWords = 0;
  let linesProcessed = 0;
  let codeLines = 0;
  let secretsMasked = 0;

  for (let line of lines) {
    const trimmed = line.trim();
    originalWords += (trimmed.match(/\b\w+\b/g) || []).length;

    if (!trimmed) {
      output.push("");
      continue;
    }

    if (isLikelyCode(trimmed)) {
      const masked = maskSecrets(trimmed);
      if (masked !== trimmed) secretsMasked++;
      output.push(masked);
      codeLines++;
      optimizedWords += (masked.match(/\b\w+\b/g) || []).length;
      continue;
    }

    linesProcessed++;

    // Multi-pass optimization
    const sentences = smartTokenize(trimmed);
    const collapsed = collapseRedundancy(sentences);

    let result = collapsed.join(". ");

    // Final cleanup
    result = result
      .replace(/\s+/g, " ")
      .replace(/\s([.,!?;:])/g, "$1")
      .replace(/\bi\b/g, "I")
      .trim();

    // Capitalize sentences properly
    result = result.replace(
      /(^|\. )([a-z])/g,
      (_, prefix, letter) => prefix + letter.toUpperCase()
    );

    // Use original if optimization made it too short or unclear
    const finalResult =
      result.length < 3 || result.split(" ").length < 2 ? trimmed : result;
    output.push(finalResult);
    optimizedWords += (finalResult.match(/\b\w+\b/g) || []).length;
  }

  const optimizedText = output.join("\n").trim();

  // Comprehensive token analysis
  const tokenAnalysis = analyzeTokens(rawInput, optimizedText);

  const stats: OptimizationStats = {
    originalWords,
    optimizedWords,
    reduction:
      originalWords > 0
        ? Math.round(((originalWords - optimizedWords) / originalWords) * 100)
        : 0,
    linesProcessed,
    codeLines,
    secretsMasked,
    totalLines: lines.length,
    efficiency:
      optimizedWords > 0
        ? Math.round((optimizedWords / originalWords) * 100)
        : 100,
    tokens: tokenAnalysis,
    // Character-level stats
    originalChars: rawInput.length,
    optimizedChars: optimizedText.length,
    charReduction:
      rawInput.length > 0
        ? Math.round(
            ((rawInput.length - optimizedText.length) / rawInput.length) * 100
          )
        : 0,
  };

  return {
    optimized: optimizedText,
    stats,
  };
};

const SuperPromptOptimizer: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [showTokens, setShowTokens] = useState<boolean>(false);
  // const [selectedTokenMethod, _] =
  //   useState<TokenizationMethod>("WORD");
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  const handleOptimize = (): void => {
    if (!input.trim()) {
      alert("Please enter some text to optimize!");
      return;
    }

    setIsLoading(true);
    setCopyFeedback("");

    // Realistic processing time
    setTimeout(() => {
      const optimizationResult = superOptimizePrompt(input);
      setResult(optimizationResult);
      setIsLoading(false);
    }, 1200);
  };

  const copyToClipboard = async (): Promise<void> => {
    if (!result?.optimized) return;

    try {
      await navigator.clipboard.writeText(result.optimized);
      setCopyFeedback("✅ Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (err) {
      setCopyFeedback("❌ Copy failed");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const clearAll = (): void => {
    setInput("");
    setResult(null);
    setCopyFeedback("");
  };

  const loadExample = (): void => {
    setInput(`Hey there! I just wanted to ask if you could please help me create a really comprehensive analysis of the data that we have. I think it would be really great if you could maybe take a look at the performance metrics and possibly generate some insights that might be useful for our team.

We basically need to understand what's working and what's not working in our current approach. I guess we should probably focus on the key performance indicators and see if there are any trends or patterns that we can identify.

It would be awesome if you could also maybe suggest some recommendations for improvement based on your analysis. Thanks so much!

Here's some sample code that shouldn't be optimized:
const API_KEY = "sk_test_1234567890abcdef";
function getData() {
  return fetch('/api/data');
}`);
  };

  const inputWordCount: number = input
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  // const _: string[] = safeTokenize(input, selectedTokenMethod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 max-w-7xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ⚡ Super Prompt Optimizer
          </h1>
          <p className="text-slate-600 text-xl mb-4">
            Advanced AI-powered text optimization with comprehensive
            tokenization (TypeScript)
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={loadExample}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              📝 Load Example
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              📊 {showStats ? "Hide" : "Show"} Stats
            </button>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🔢 {showTokens ? "Hide" : "Show"} Tokens
            </button>
            <button
              onClick={clearAll}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-700">
                Input Text
              </h3>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {inputWordCount} words
              </span>
            </div>
            <textarea
              rows={14}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your verbose text, prompts, or documents here..."
              className="w-full p-4 text-base font-mono leading-relaxed border-2 border-slate-300 rounded-xl bg-slate-50 resize-none outline-none focus:border-violet-500 focus:bg-white transition-colors"
            />

            <button
              onClick={handleOptimize}
              disabled={isLoading || !input.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Optimizing...
                </>
              ) : (
                <>⚡ Super Optimize</>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-700">
                Optimized Result
              </h3>
              {result && (
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  {result.stats.optimizedWords} words (-{result.stats.reduction}
                  %)
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 h-80 overflow-y-auto">
                  <pre className="text-green-900 whitespace-pre-wrap text-base leading-relaxed">
                    {result.optimized}
                  </pre>
                </div>

                {showStats && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      📊 Optimization Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="text-blue-700 font-medium">
                          Word Reduction
                        </div>
                        <div className="font-mono text-blue-900 text-lg">
                          {result.stats.reduction}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-blue-700 font-medium">
                          Efficiency
                        </div>
                        <div className="font-mono text-blue-900 text-lg">
                          {result.stats.efficiency}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-blue-700 font-medium">
                          Lines Processed
                        </div>
                        <div className="font-mono text-blue-900 text-lg">
                          {result.stats.linesProcessed}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-blue-700 font-medium">
                          Code Lines
                        </div>
                        <div className="font-mono text-blue-900 text-lg">
                          {result.stats.codeLines}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-blue-700 font-medium">
                          Secrets Masked
                        </div>
                        <div className="font-mono text-blue-900 text-lg">
                          {result.stats.secretsMasked}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-blue-700 font-medium">
                          Total Lines
                        </div>
                        <div className="font-mono text-blue-900 text-lg">
                          {result.stats.totalLines}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={copyToClipboard}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {copyFeedback || "📋 Copy Optimized Text"}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-xl font-medium mb-2">
                    Your optimized text will appear here
                  </p>
                  <p className="text-sm">
                    Enter text above and click "Super Optimize"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h4 className="font-semibold text-indigo-900 mb-4 text-lg">
            🧠 Enhanced Super Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-indigo-800 flex items-center gap-2">
                <span className="text-lg">✂️</span> Advanced Filtering
              </div>
              <div className="text-indigo-600">
                Removes 60+ filler words, redundant phrases, and weak verbs with
                context awareness
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-indigo-800 flex items-center gap-2">
                <span className="text-lg">🔄</span> Smart Reconstruction
              </div>
              <div className="text-indigo-600">
                Rebuilds sentences with action verbs first and maintains
                semantic meaning
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-indigo-800 flex items-center gap-2">
                <span className="text-lg">🛡️</span> Security Protection
              </div>
              <div className="text-indigo-600">
                Detects and preserves code while masking API keys, passwords,
                and secrets
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-indigo-800 flex items-center gap-2">
                <span className="text-lg">📈</span> Performance Metrics
              </div>
              <div className="text-indigo-600">
                Detailed analytics on word reduction, efficiency, and processing
                statistics
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperPromptOptimizer;
