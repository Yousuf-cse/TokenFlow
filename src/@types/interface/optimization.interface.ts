import type { TokenAnalysis } from "./tokenAnalysis.interface";

export interface OptimizationStats {
  originalWords: number;
  optimizedWords: number;
  reduction: number;
  linesProcessed: number;
  codeLines: number;
  secretsMasked: number;
  totalLines: number;
  preservedLines: number;
  efficiency: number;
  tokens: Record<string, TokenAnalysis>;
  originalChars: number;
  optimizedChars: number;
  charReduction: number;
}
