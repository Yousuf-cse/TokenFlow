// Type definitions
export interface TokenAnalysis {
  original: number;
  optimized: number;
  reduction: number;
  tokens: {
    original: string[];
    optimized: string[];
  };
}
