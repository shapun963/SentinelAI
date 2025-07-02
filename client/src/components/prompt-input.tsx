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
    <Card className="glass-card border-white/20 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl">
          <Keyboard className="w-6 h-6 text-blue-400 mr-3" />
          <span className="gradient-text">Prompt Input</span>
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
              className="w-full font-mono text-sm resize-none bg-black/30 border-2 border-blue-500/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 backdrop-blur-sm text-gray-100 placeholder-gray-400 transition-all duration-300 hover:border-blue-400/70"
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg neon-glow transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Analyze Prompt
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
              className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
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
