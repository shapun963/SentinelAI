import { BarChart3, Shield, User, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import type { AnalysisResult } from "@shared/schema";

interface ScoreDashboardProps {
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
}

export function ScoreDashboard({ analysisResult, isLoading }: ScoreDashboardProps) {
  const [animatedScores, setAnimatedScores] = useState({
    overall: 0,
    prompt: 0,
    pii: 0,
    bias: 0,
    racial: 0,
    gender: 0,
    age: 0,
    religious: 0
  });

  useEffect(() => {
    if (!analysisResult) {
      setAnimatedScores({
        overall: 0,
        prompt: 0,
        pii: 0,
        bias: 0,
        racial: 0,
        gender: 0,
        age: 0,
        religious: 0
      });
      return;
    }

    const targetScores = {
      overall: analysisResult.overall.score,
      prompt: analysisResult.promptInjection.score,
      pii: analysisResult.pii.score,
      bias: analysisResult.bias.score,
      racial: analysisResult.bias.racial,
      gender: analysisResult.bias.gender,
      age: analysisResult.bias.age,
      religious: analysisResult.bias.religious
    };

    // Animate scores
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedScores(prev => ({
        overall: Math.round(targetScores.overall * easeOut),
        prompt: Math.round(targetScores.prompt * easeOut),
        pii: Math.round(targetScores.pii * easeOut),
        bias: Math.round(targetScores.bias * easeOut),
        racial: Math.round(targetScores.racial * easeOut),
        gender: Math.round(targetScores.gender * easeOut),
        age: Math.round(targetScores.age * easeOut),
        religious: Math.round(targetScores.religious * easeOut)
      }));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedScores(targetScores);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [analysisResult]);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 text-[hsl(142,76%,36%)] mr-2" />
          Security Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Overall Security Score</span>
            <span className="text-2xl font-bold text-[hsl(207,90%,54%)]">
              {isLoading ? '--' : animatedScores.overall}
            </span>
          </div>
          <Progress 
            value={isLoading ? 0 : animatedScores.overall} 
            className="h-2"
          />
        </div>

        {/* Individual Scores */}
        <div className="space-y-6">
          {/* GuardPrompt - Prompt Injection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 flex items-center">
                <Shield className="w-4 h-4 text-[hsl(0,84%,60%)] mr-2" />
                Prompt Injection
              </span>
              <span className="font-bold text-[hsl(0,84%,60%)]">
                {isLoading ? '--' : `${animatedScores.prompt}%`}
              </span>
            </div>
            <Progress 
              value={isLoading ? 0 : animatedScores.prompt} 
              className="h-2"
            />
          </div>

          {/* AdShield - PII */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 text-[hsl(217,91%,60%)] mr-2" />
                PII Detection
              </span>
              <span className="font-bold text-[hsl(217,91%,60%)]">
                {isLoading ? '--' : `${animatedScores.pii}%`}
              </span>
            </div>
            <Progress 
              value={isLoading ? 0 : animatedScores.pii} 
              className="h-2"
            />
          </div>

          {/* AdShield - Bias */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 flex items-center">
                <Scale className="w-4 h-4 text-[hsl(38,92%,50%)] mr-2" />
                Bias Detection
              </span>
              <span className="font-bold text-[hsl(38,92%,50%)]">
                {isLoading ? '--' : `${animatedScores.bias}%`}
              </span>
            </div>
            <Progress 
              value={isLoading ? 0 : animatedScores.bias} 
              className="h-2"
            />
            
            {/* Bias Subsections */}
            <div className="ml-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Racial Bias:</span>
                <span className="font-medium">
                  {isLoading ? '--' : `${animatedScores.racial}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender Bias:</span>
                <span className="font-medium">
                  {isLoading ? '--' : `${animatedScores.gender}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age Bias:</span>
                <span className="font-medium">
                  {isLoading ? '--' : `${animatedScores.age}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Religious Bias:</span>
                <span className="font-medium">
                  {isLoading ? '--' : `${animatedScores.religious}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
