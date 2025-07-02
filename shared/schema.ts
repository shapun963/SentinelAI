import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  prompt: true,
  results: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Sentinel AI Analysis Types
export interface AnalysisResult {
  promptInjection: {
    score: number;
    detected: boolean;
    indices: Array<{ start: number; end: number; type: string; severity: string }>;
  };
  pii: {
    score: number;
    detected: boolean;
    indices: Array<{ start: number; end: number; type: string; piiType: string }>;
  };
  bias: {
    score: number;
    detected: boolean;
    indices: Array<{ start: number; end: number; type: string; biasType: string }>;
    racial: number;
    gender: number;
    age: number;
    religious: number;
  };
  overall: {
    score: number;
    riskLevel: "low" | "medium" | "high";
  };
  summary: {
    trustLens: string;
    recommendations: string[];
    riskFactors: string[];
  };
}

export const analyzePromptSchema = z.object({
  prompt: z.string().min(1).max(10000),
});

export type AnalyzePromptRequest = z.infer<typeof analyzePromptSchema>;
