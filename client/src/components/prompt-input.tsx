import { useState } from "react";
import { Keyboard, Play, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
  onAnalyze: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onAnalyze, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      return;
    }

    // Simulate progress steps
    if (isLoading) {
      const steps = [
        { text: 'Initializing GuardPrompt...', progress: 10 },
        { text: 'Scanning for prompt injections...', progress: 30 },
        { text: 'Running AdShield PII detection...', progress: 50 },
        { text: 'Analyzing bias patterns...', progress: 70 },
        { text: 'Generating TrustLens summary...', progress: 90 },
        { text: 'Analysis complete!', progress: 100 }
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length && isLoading) {
          setProgressText(steps[currentStep].text);
          setProgress(steps[currentStep].progress);
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, 800);
    }

    onAnalyze(prompt.trim());
  };

  const handleClear = () => {
    setPrompt("");
    setProgress(0);
    setProgressText("");
  };

  const charCount = prompt.length;
  const maxChars = 10000;

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Keyboard className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
          Prompt Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-input">
              Enter your prompt for analysis:
            </Label>
            <Textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="font-mono text-sm resize-none"
              placeholder="Type or paste your AI prompt here for security analysis..."
              maxLength={maxChars}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Max {maxChars.toLocaleString()} characters</span>
              <span className={charCount > maxChars * 0.9 ? 'text-red-500' : ''}>
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={!prompt.trim() || isLoading}
              className="flex-1 bg-[hsl(207,90%,54%)] hover:bg-[hsl(207,90%,44%)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Analyze Prompt
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2 animate-slide-up">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressText || "Initializing analysis..."}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
