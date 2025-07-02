import { useState } from "react";
import { FileText, Eye, EyeOff, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisResultsProps {
  originalPrompt: string;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
}

export function AnalysisResults({ originalPrompt, analysisResult, isLoading }: AnalysisResultsProps) {
  const [maskedPiiIndices, setMaskedPiiIndices] = useState<Set<number>>(new Set());
  const [showAllMasked, setShowAllMasked] = useState(false);

  const togglePiiMask = (index: number) => {
    const newMasked = new Set(maskedPiiIndices);
    if (newMasked.has(index)) {
      newMasked.delete(index);
    } else {
      newMasked.add(index);
    }
    setMaskedPiiIndices(newMasked);
  };

  const toggleAllPii = () => {
    if (!analysisResult?.pii.indices.length) return;
    
    if (showAllMasked) {
      setMaskedPiiIndices(new Set());
      setShowAllMasked(false);
    } else {
      const allPiiIndices = new Set(analysisResult.pii.indices.map((_, index) => index));
      setMaskedPiiIndices(allPiiIndices);
      setShowAllMasked(true);
    }
  };

  const renderHighlightedText = () => {
    if (!analysisResult || !originalPrompt) {
      return (
        <div className="text-gray-500 text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Submit text for analysis to see highlighted results here</p>
        </div>
      );
    }

    let text = originalPrompt;
    
    // Process highlights from end to start to maintain indices
    const sortedIndices = [
      ...analysisResult.promptInjection.indices.map(i => ({ ...i, class: 'highlight-injection', type: 'injection' as const })),
      ...analysisResult.bias.indices.map(i => ({ ...i, class: 'highlight-bias', type: 'bias' as const }))
    ].sort((a, b) => b.start - a.start);
    
    // Apply non-PII highlights first
    sortedIndices.forEach(item => {
      const before = text.substring(0, item.start);
      const highlighted = text.substring(item.start, item.end);
      const after = text.substring(item.end);
      text = before + `<span class="${item.class}">${highlighted}</span>` + after;
    });
    
    // Process PII highlights separately with masking logic
    const piiIndices = analysisResult.pii.indices
      .map((i, idx) => ({ ...i, piiIndex: idx }))
      .sort((a, b) => b.start - a.start);
    
    piiIndices.forEach(item => {
      const before = text.substring(0, item.start);
      const highlighted = text.substring(item.start, item.end);
      const after = text.substring(item.end);
      
      if (maskedPiiIndices.has(item.piiIndex)) {
        const maskLength = highlighted.length;
        const maskedText = '█'.repeat(maskLength);
        text = before + `<span class="highlight-pii masked-pii">${maskedText}</span>` + after;
      } else {
        text = before + `<span class="highlight-pii">${highlighted}</span>` + after;
      }
    });

    return (
      <div 
        className="animate-fade-in whitespace-pre-wrap font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  const renderPiiControls = () => {
    if (!analysisResult?.pii.detected || !analysisResult.pii.indices.length) {
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">PII Protection</span>
          </div>
          <Button
            onClick={toggleAllPii}
            size="sm"
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            {showAllMasked ? (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Show All
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Mask All
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          {analysisResult.pii.indices.map((piiItem, index) => {
            const detectedText = originalPrompt.substring(piiItem.start, piiItem.end);
            const isMasked = maskedPiiIndices.has(index);
            
            return (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-black/20 rounded border border-white/10">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {piiItem.piiType}
                  </Badge>
                  <span className="font-mono text-sm">
                    {isMasked ? '█'.repeat(detectedText.length) : `"${detectedText}"`}
                  </span>
                </div>
                <Button
                  onClick={() => togglePiiMask(index)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  {isMasked ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-card border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-400 mr-3" />
            <span className="gradient-text">Analysis Results</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Real-time</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-64 bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Analyzing prompt...</p>
            </div>
          ) : (
            renderHighlightedText()
          )}
        </div>
        
        {/* PII Protection Controls */}
        {!isLoading && renderPiiControls()}
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border-l-2 border-red-500 mr-2"></div>
            <span>Prompt Injection</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border-l-2 border-yellow-500 mr-2"></div>
            <span>Bias Detection</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 mr-2"></div>
            <span>PII Detection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
