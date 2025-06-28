import type { OptimizationStats } from "./optimization.interface";

export interface OptimizationResult {
  optimized: string;
  stats: OptimizationStats;
}
