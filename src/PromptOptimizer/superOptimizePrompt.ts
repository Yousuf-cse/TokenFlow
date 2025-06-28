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

export default superOptimizePrompt;