import { apiRequest } from "./queryClient";
import type { AnalysisResult, AnalyzePromptRequest } from "@shared/schema";

export async function analyzePrompt(request: AnalyzePromptRequest): Promise<AnalysisResult> {
  const response = await apiRequest("POST", "/api/analyze", request);
  return response.json();
}

export async function getRecentAnalyses() {
  const response = await apiRequest("GET", "/api/analyses");
  return response.json();
}
