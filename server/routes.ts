import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzePromptSchema, type AnalysisResult } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sentinel AI Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { prompt } = analyzePromptSchema.parse(req.body);
      
      // Simulate Sentinel AI analysis processing
      const analysisResult = await performSentinelAIAnalysis(prompt);
      
      // Store analysis in memory
      await storage.createAnalysis({
        prompt,
        results: analysisResult as any
      });

      res.json(analysisResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request", 
          errors: error.flatten().fieldErrors 
        });
      } else {
        res.status(500).json({ message: "Analysis failed" });
      }
    }
  });

  // Get recent analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getRecentAnalyses(10);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function performSentinelAIAnalysis(prompt: string): Promise<AnalysisResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const text = prompt.toLowerCase();
  const promptLength = prompt.length;
  
  // GuardPrompt - Detect prompt injections
  const injectionPatterns = [
    'ignore', 'forget', 'override', 'bypass', 'system', 'admin', 'root',
    'previous instructions', 'new instructions', 'disregard', 'nevermind'
  ];
  
  const injectionDetections = [];
  let injectionScore = 0;
  
  injectionPatterns.forEach(pattern => {
    const index = text.indexOf(pattern);
    if (index !== -1) {
      injectionDetections.push({
        start: index,
        end: index + pattern.length,
        type: 'injection',
        severity: 'high'
      });
      injectionScore += 25;
    }
  });

  // AdShield - PII Detection
  const piiPatterns = [
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'email' },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'ssn' },
    { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, type: 'phone' },
    { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, type: 'credit_card' }
  ];
  
  const piiDetections = [];
  let piiScore = 0;
  
  piiPatterns.forEach(({ pattern, type }) => {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      piiDetections.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'pii',
        piiType: type
      });
      piiScore += 30;
    }
  });

  // AdShield - Bias Detection
  const biasPatterns = {
    racial: ['black', 'white', 'asian', 'hispanic', 'race', 'ethnic'],
    gender: ['women', 'men', 'female', 'male', 'girl', 'boy', 'gender'],
    age: ['old', 'young', 'elderly', 'teenager', 'boomer', 'millennial'],
    religious: ['christian', 'muslim', 'jewish', 'hindu', 'buddhist', 'religion']
  };
  
  const biasDetections = [];
  const biasScores = { racial: 0, gender: 0, age: 0, religious: 0 };
  
  Object.entries(biasPatterns).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      const index = text.indexOf(pattern);
      if (index !== -1) {
        biasDetections.push({
          start: index,
          end: index + pattern.length,
          type: 'bias',
          biasType: category
        });
        biasScores[category as keyof typeof biasScores] += 20;
      }
    });
  });

  const totalBiasScore = Math.max(...Object.values(biasScores));

  // Calculate overall score
  const overallScore = Math.max(0, 100 - Math.min(100, injectionScore + piiScore + totalBiasScore));
  const riskLevel = overallScore >= 70 ? 'low' : overallScore >= 40 ? 'medium' : 'high';

  // Generate TrustLens summary
  const riskFactors = [];
  const recommendations = [];
  
  if (injectionDetections.length > 0) {
    riskFactors.push("Potential prompt injection patterns detected");
    recommendations.push("Review and sanitize input to remove instruction manipulation attempts");
  }
  
  if (piiDetections.length > 0) {
    riskFactors.push("Personal identifiable information (PII) found in prompt");
    recommendations.push("Remove or redact PII before processing with AI systems");
  }
  
  if (biasDetections.length > 0) {
    riskFactors.push("Bias-related terminology identified");
    recommendations.push("Consider rephrasing to use more inclusive language");
  }

  if (riskFactors.length === 0) {
    riskFactors.push("No significant security risks detected");
    recommendations.push("Prompt appears safe for AI processing");
  }

  const trustLensSummary = riskLevel === 'high' 
    ? "High-risk prompt detected with multiple security concerns. Immediate review recommended before AI processing."
    : riskLevel === 'medium'
    ? "Moderate security risks identified. Consider prompt modifications to improve safety profile."
    : "Prompt appears safe with minimal security concerns detected.";

  return {
    promptInjection: {
      score: Math.min(100, injectionScore),
      detected: injectionDetections.length > 0,
      indices: injectionDetections
    },
    pii: {
      score: Math.min(100, piiScore),
      detected: piiDetections.length > 0,
      indices: piiDetections
    },
    bias: {
      score: Math.min(100, totalBiasScore),
      detected: biasDetections.length > 0,
      indices: biasDetections,
      racial: biasScores.racial,
      gender: biasScores.gender,
      age: biasScores.age,
      religious: biasScores.religious
    },
    overall: {
      score: overallScore,
      riskLevel
    },
    summary: {
      trustLens: trustLensSummary,
      recommendations,
      riskFactors
    }
  };
}
