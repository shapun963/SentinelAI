import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisResultsProps {
  originalPrompt: string;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
}

export function AnalysisResults({ originalPrompt, analysisResult, isLoading }: AnalysisResultsProps) {
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
    const allIndices = [
      ...analysisResult.promptInjection.indices.map(i => ({ ...i, class: 'highlight-injection' })),
      ...analysisResult.pii.indices.map(i => ({ ...i, class: 'highlight-pii' })),
      ...analysisResult.bias.indices.map(i => ({ ...i, class: 'highlight-bias' }))
    ].sort((a, b) => b.start - a.start);

    // Apply highlights from end to start to maintain indices
    allIndices.forEach(item => {
      const before = text.substring(0, item.start);
      const highlighted = text.substring(item.start, item.end);
      const after = text.substring(item.end);
      text = before + `<span class="${item.class}">${highlighted}</span>` + after;
    });

    return (
      <div 
        className="animate-fade-in whitespace-pre-wrap font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
            Analysis Results
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-500">Real-time</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-64 bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Analyzing prompt...</p>
            </div>
          ) : (
            renderHighlightedText()
          )}
        </div>
        
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
