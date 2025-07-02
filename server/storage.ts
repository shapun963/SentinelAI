import { users, analyses, type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analyses: Map<number, Analysis>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = { 
      ...insertAnalysis, 
      id,
      createdAt: new Date()
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
