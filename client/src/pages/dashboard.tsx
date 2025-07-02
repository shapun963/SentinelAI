import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { AnalysisResults } from "@/components/analysis-results";
import { ScoreDashboard } from "@/components/score-dashboard";
import { SummaryPanel } from "@/components/summary-panel";
import { PromptInput } from "@/components/prompt-input";
import { analyzePrompt } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@shared/schema";

export default function Dashboard() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: analyzePrompt,
    onSuccess: (result) => {
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Your prompt has been successfully analyzed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = (prompt: string) => {
    setCurrentPrompt(prompt);
    setAnalysisResult(null);
    analyzeMutation.mutate({ prompt });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Section 1: Analysis Results */}
            <AnalysisResults
              originalPrompt={currentPrompt}
              analysisResult={analysisResult}
              isLoading={analyzeMutation.isPending}
            />
            
            {/* Section 4: Summary Panel */}
            <SummaryPanel
              analysisResult={analysisResult}
              isLoading={analyzeMutation.isPending}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Section 5: Score Dashboard */}
            <ScoreDashboard
              analysisResult={analysisResult}
              isLoading={analyzeMutation.isPending}
            />
            
            {/* Section 6: Prompt Input */}
            <PromptInput
              onAnalyze={handleAnalyze}
              isLoading={analyzeMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
