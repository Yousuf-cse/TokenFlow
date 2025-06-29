import React, { useState } from "react";
import { AlertTriangle, Shield, Eye, EyeOff, X } from "lucide-react";
import {
  detectAndMaskSecrets,
  type SecretDetection,
} from "./detectAndMaskSecrets";

// Mock data for demonstration
const FILLERS = new Set([
  "um",
  "uh",
  "like",
  "you know",
  "basically",
  "actually",
]);
const REDUNDANT_PHRASES = [
  ["I just wanted to ask if you could", "Please"],
  ["it would be really great if", "please"],
  ["I think it would be", ""],
  ["maybe take a look at", "analyze"],
  ["possibly generate some", "generate"],
];
const ACTION_VERBS = ["analyze", "create", "generate", "process", "optimize"];
const PERSONAL_PRONOUNS = new Set(["i", "you", "we", "they"]);
const WEAK_VERBS = {
  is: "represents",
  was: "became",
  are: "exist",
  were: "became",
};

// type TokenizationMethod =
//   | "WORD"
//   | "GPT_APPROX"
//   | "CHARACTER"
//   | "SENTENCE"
//   | "SUBWORD";

interface TokenAnalysis {
  original: number;
  optimized: number;
  reduction: number;
  tokens: {
    original: string[];
    optimized: string[];
  };
}

interface OptimizationStats {
  originalWords: number;
  optimizedWords: number;
  reduction: number;
  linesProcessed: number;
  codeLines: number;
  secretsMasked: number;
  totalLines: number;
  efficiency: number;
  tokens: Record<string, TokenAnalysis>;
  originalChars: number;
  optimizedChars: number;
  charReduction: number;
  preservedLines: number;
}

interface OptimizationResult {
  optimized: string;
  stats: OptimizationStats;
}

const isLikelyCode = (text: string): boolean => {
  const codePatterns = [
    /^\s*(const|let|var|function|class|import|export)/,
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=:]/,
    /^\s*[{}[\]();]/,
    /API_KEY|SECRET|TOKEN/i,
  ];
  return codePatterns.some((pattern) => pattern.test(text));
};

// Enhanced secret detection with detailed information

// Rest of the optimization functions (simplified for demo)
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

const reconstructSentence = (tokens: string[]): string => {
  if (tokens.length === 0) return "";
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

const smartTokenize = (text: string): string[] => {
  text = removeRedundantPhrases(text);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  const optimizedSentences: string[] = [];

  for (let sentence of sentences) {
    const words = sentence.toLowerCase().match(/\b[\w']+\b/g) || [];
    const tokens: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i + 1];

      if (FILLERS.has(word) || PERSONAL_PRONOUNS.has(word)) {
        if (
          PERSONAL_PRONOUNS.has(word) &&
          nextWord &&
          ACTION_VERBS.includes(nextWord)
        ) {
          tokens.push(word);
        }
        continue;
      }

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
          tokens.push(word);
        }
        continue;
      }

      const strongVerb = WEAK_VERBS[word as keyof typeof WEAK_VERBS];
      tokens.push(strongVerb || word);
    }

    if (tokens.length > 0) {
      optimizedSentences.push(reconstructSentence(tokens));
    }
  }

  return optimizedSentences;
};

const collapseRedundancy = (sentences: string[]): string[] => {
  return sentences
    .filter((sentence) => sentence.length > 2)
    .map((sentence) => {
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

const superOptimizePrompt = (
  rawInput: string
): OptimizationResult & {
  secretDetections: SecretDetection[];
} => {
  const lines = rawInput.split("\n");
  const output: string[] = [];
  let originalWords = 0;
  let optimizedWords = 0;
  let linesProcessed = 0;
  let codeLines = 0;
  let secretsMasked = 0;
  const allSecretDetections: SecretDetection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    originalWords += (trimmed.match(/\b\w+\b/g) || []).length;

    if (!trimmed) {
      output.push("");
      continue;
    }

    if (isLikelyCode(trimmed)) {
      const { maskedText, detections } = detectAndMaskSecrets(trimmed, i + 1);
      console.log("Detection <=======", detections);
      allSecretDetections.push(...detections);

      if (detections.length > 0) secretsMasked += detections.length;
      output.push(maskedText);
      codeLines++;
      optimizedWords += (maskedText.match(/\b\w+\b/g) || []).length;
      continue;
    }

    linesProcessed++;
    const sentences = smartTokenize(trimmed);
    const collapsed = collapseRedundancy(sentences);
    let result = collapsed.join(". ");

    result = result
      .replace(/\s+/g, " ")
      .replace(/\s([.,!?;:])/g, "$1")
      .replace(/\bi\b/g, "I")
      .trim();

    result = result.replace(
      /(^|\. )([a-z])/g,
      (_, prefix, letter) => prefix + letter.toUpperCase()
    );

    const finalResult =
      result.length < 3 || result.split(" ").length < 2 ? trimmed : result;
    output.push(finalResult);
    optimizedWords += (finalResult.match(/\b\w+\b/g) || []).length;
  }

  const optimizedText = output.join("\n").trim();

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
    tokens: {},
    originalChars: rawInput.length,
    optimizedChars: optimizedText.length,
    charReduction:
      rawInput.length > 0
        ? Math.round(
            ((rawInput.length - optimizedText.length) / rawInput.length) * 100
          )
        : 0,
    preservedLines: 0,
  };

  return {
    optimized: optimizedText,
    stats,
    secretDetections: allSecretDetections,
  };
};

const SecretWarningModal: React.FC<{
  detections: SecretDetection[];
  onClose: () => void;
  onProceed: () => void;
  onCancel: () => void;
}> = ({ detections, onClose, onProceed, onCancel }) => {
  const [showDetails, setShowDetails] = useState(false);

  const highRiskCount = detections.filter((d) => d.severity === "high").length;
  const mediumRiskCount = detections.filter(
    (d) => d.severity === "medium"
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Security Warning</h2>
                <p className="text-red-100">
                  Potential secrets detected in your text
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-red-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {highRiskCount} High Risk
              </div>
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {mediumRiskCount} Medium Risk
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              We detected {detections.length} potential secret
              {detections.length !== 1 ? "s" : ""} in your text. These will be
              automatically masked with asterisks (*) for security.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                {showDetails ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showDetails ? "Hide" : "Show"} Details
              </button>
            </div>

            {showDetails && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {detections.map((detection, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-red-300"
                  >
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        detection.severity === "high"
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {detection.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Line {detection.line}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {detection.pattern}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Security Measures
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Detected secrets will be replaced with asterisks (*)
                  </li>
                  <li>• Original structure and functionality preserved</li>
                  <li>• No sensitive data will be stored or transmitted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Proceed with Masking
          </button>
        </div>
      </div>
    </div>
  );
};

const SuperPromptOptimizer: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<
    (OptimizationResult & { secretDetections: SecretDetection[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [copyFeedback, setCopyFeedback] = useState<string>("");
  const [pendingOptimization, setPendingOptimization] = useState<string>("");
  const [showSecretWarning, setShowSecretWarning] = useState<boolean>(false);
  const [secretDetections, setSecretDetections] = useState<SecretDetection[]>(
    []
  );

  const checkForSecrets = (text: string): SecretDetection[] => {
    const lines = text.split("\n");
    const allDetections: SecretDetection[] = [];

    lines.forEach((line, index) => {
      if (isLikelyCode(line.trim())) {
        const { detections } = detectAndMaskSecrets(line, index + 1);
        allDetections.push(...detections);
      }
    });

    return allDetections;
  };

  const handleOptimize = (): void => {
    if (!input.trim()) {
      alert("Please enter some text to optimize!");
      return;
    }

    // Check for secrets before optimization
    const detectedSecrets = checkForSecrets(input);

    if (detectedSecrets.length > 0) {
      setSecretDetections(detectedSecrets);
      setPendingOptimization(input);
      setShowSecretWarning(true);
      return;
    }

    // Proceed with optimization if no secrets detected
    proceedWithOptimization(input);
  };

  const proceedWithOptimization = (textToOptimize: string): void => {
    setIsLoading(true);
    setCopyFeedback("");

    setTimeout(() => {
      const optimizationResult = superOptimizePrompt(textToOptimize);
      setResult(optimizationResult);
      setIsLoading(false);
    }, 1200);
  };

  const handleSecretWarningProceed = (): void => {
    setShowSecretWarning(false);
    proceedWithOptimization(pendingOptimization);
    setPendingOptimization("");
    setSecretDetections([]);
  };

  const handleSecretWarningCancel = (): void => {
    setShowSecretWarning(false);
    setPendingOptimization("");
    setSecretDetections([]);
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
const DATABASE_PASSWORD = "mySecretPassword123";
function getData() {
  return fetch('/api/data');
}`);
  };

  const inputWordCount: number = input
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {showSecretWarning && (
        <SecretWarningModal
          detections={secretDetections}
          onClose={handleSecretWarningCancel}
          onProceed={handleSecretWarningProceed}
          onCancel={handleSecretWarningCancel}
        />
      )}

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 max-w-7xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ⚡ Super Prompt Optimizer
          </h1>
          <p className="text-slate-600 text-xl mb-4">
            Advanced AI-powered text optimization with secret detection &
            security warnings
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

                {result.secretDetections.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      🔒 Security Report
                    </h4>
                    <p className="text-amber-800 text-sm mb-2">
                      {result.secretDetections.length} secret
                      {result.secretDetections.length !== 1 ? "s" : ""} detected
                      and masked
                    </p>
                    <div className="text-xs text-amber-700 space-y-1">
                      {result.secretDetections.map((detection, index) => (
                        <div
                          key={index}
                          className="bg-amber-100 rounded px-2 py-1"
                        >
                          Line {detection.line}: {detection.type} (
                          {detection.severity} risk)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                Detects and masks API keys, passwords, and secrets with security
                warnings
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-indigo-800 flex items-center gap-2">
                <span className="text-lg">📈</span> Performance Metrics
              </div>
              <div className="text-indigo-600">
                Detailed analytics on word reduction, efficiency, and security
                statistics
              </div>
            </div>
          </div>
        </div>

        {/* Security Features Info */}
        <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <h4 className="font-semibold text-red-900 mb-4 text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            🔐 New: Advanced Security Detection
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-red-800">
                Real-time Detection
              </div>
              <div className="text-red-600">
                Automatically scans for API keys, passwords, tokens, and
                connection strings
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-red-800">Smart Warnings</div>
              <div className="text-red-600">
                Interactive alerts with severity levels and detailed breakdowns
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-red-800">Safe Processing</div>
              <div className="text-red-600">
                Masks sensitive data while preserving code functionality
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperPromptOptimizer;
