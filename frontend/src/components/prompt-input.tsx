import { useState } from "react";
import { Keyboard, Play, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

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
    <div className="relative min-h-[50vh] flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
      
      <Card className="glass-card border-white/20 shadow-2xl w-full max-w-4xl relative z-10 animate-float">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center neon-glow animate-glow">
              <Keyboard className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold gradient-text mb-2">
            Sentinel AI Security Analysis
          </CardTitle>
          <p className="text-gray-400 text-lg">
            Enter your AI prompt below to analyze for security vulnerabilities, PII, and bias detection
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full text-lg resize-none bg-black/40 border-2 border-blue-500/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 backdrop-blur-sm text-gray-100 placeholder-gray-500 transition-all duration-500 hover:border-blue-400/50 rounded-xl p-6 font-mono leading-relaxed"
                placeholder="Enter your AI prompt here for comprehensive security analysis..."
                maxLength={maxChars}
                disabled={isLoading}
              />
              <div className="flex justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>AI Security Analysis Ready</span>
                </div>
                <span className={charCount > maxChars * 0.9 ? 'text-red-400' : 'text-gray-400'}>
                  {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                disabled={!prompt.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg neon-glow transition-all duration-300 text-lg py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing Prompt...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    Analyze Prompt
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
                className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm py-6 px-6"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            {isLoading && (
              <div className="space-y-3 animate-slide-up">
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="font-medium">{progressText || "Initializing analysis..."}</span>
                </div>
                <Progress value={progress} className="h-3 bg-black/30" />
                <div className="text-center text-xs text-gray-500">
                  Processing with GuardPrompt • AdShield • TrustLens
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}