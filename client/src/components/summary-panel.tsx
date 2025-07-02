import { Eye, ClipboardList, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@shared/schema";

interface SummaryPanelProps {
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
}

export function SummaryPanel({ analysisResult, isLoading }: SummaryPanelProps) {
  if (isLoading) {
    return (
      <Card className="glass-card border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Eye className="w-6 h-6 text-purple-400 mr-3" />
            <span className="gradient-text">TrustLens Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-400">Generating summary...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card className="glass-card border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Eye className="w-6 h-6 text-purple-400 mr-3" />
            <span className="gradient-text">TrustLens Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 text-center py-8">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Detailed analysis summary will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overall, summary } = analysisResult;
  const riskColor = overall.riskLevel === 'high' ? 'destructive' : 
                   overall.riskLevel === 'medium' ? 'secondary' : 'default';

  return (
    <Card className="glass-card border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Eye className="w-6 h-6 text-purple-400 mr-3" />
          <span className="gradient-text">TrustLens Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 animate-fade-in">
        {/* Risk Level Badge */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Risk Level:</span>
          <Badge variant={riskColor} className="capitalize">
            {overall.riskLevel}
          </Badge>
        </div>

        {/* Summary Text */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">{summary.trustLens}</p>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {summary.riskFactors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
              Risk Factors
            </h4>
            <ul className="space-y-1">
              {summary.riskFactors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {summary.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {summary.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
