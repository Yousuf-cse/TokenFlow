import type { SecretDetection } from "@/PromptOptimizer/detectAndMaskSecrets";
import type { OptimizationStats } from "./optimization.interface";

export interface OptimizationResult {
  optimized: string;
  stats: OptimizationStats;
  detections?: SecretDetection[];
}
