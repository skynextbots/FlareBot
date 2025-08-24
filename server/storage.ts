import { 
  type User, type InsertUser,
  type VerificationSession, type InsertVerificationSession,
  type BotConfiguration, type InsertBotConfiguration,
  type AdminSession, type InsertAdminSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Verification session methods
  getVerificationSession(id: string): Promise<VerificationSession | undefined>;
  createVerificationSession(session: InsertVerificationSession): Promise<VerificationSession>;
  updateVerificationSession(id: string, updates: Partial<VerificationSession>): Promise<VerificationSession | undefined>;
  getVerificationSessionByCode(code: string): Promise<VerificationSession | undefined>;
  getActiveVerificationSessions(): Promise<VerificationSession[]>;

  // Bot configuration methods
  getBotConfiguration(id: string): Promise<BotConfiguration | undefined>;
  createBotConfiguration(config: InsertBotConfiguration): Promise<BotConfiguration>;
  updateBotConfiguration(id: string, updates: Partial<BotConfiguration>): Promise<BotConfiguration | undefined>;
  getBotConfigurationsBySession(sessionId: string): Promise<BotConfiguration[]>;

  // Admin session methods
  getAdminSession(id: string): Promise<AdminSession | undefined>;
  createAdminSession(session: InsertAdminSession): Promise<AdminSession>;
  getActiveAdminSession(): Promise<AdminSession | undefined>;
  deactivateAdminSession(id: string): Promise<void>;

  // Admin dashboard methods
  getAllSubmissions(): Promise<Array<{
    id: string;
    robloxUsername: string;
    verificationCode: string;
    isVerified: boolean;
    game?: string;
    mode?: string;
    createdAt: Date;
    status: 'pending' | 'verified' | 'failed';
  }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private verificationSessions: Map<string, VerificationSession>;
  private botConfigurations: Map<string, BotConfiguration>;
  private adminSessions: Map<string, AdminSession>;

  constructor() {
    this.users = new Map();
    this.verificationSessions = new Map();
    this.botConfigurations = new Map();
    this.adminSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getVerificationSession(id: string): Promise<VerificationSession | undefined> {
    return this.verificationSessions.get(id);
  }

  async createVerificationSession(session: InsertVerificationSession): Promise<VerificationSession> {
    const id = randomUUID();
    const code = `Verify_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const newSession: VerificationSession = {
      id,
      ...session,
      verificationCode: code,
      isVerified: false,
      expiresAt,
      createdAt: new Date(),
    };
    this.verificationSessions.set(id, newSession);
    return newSession;
  }

  async updateVerificationSession(id: string, updates: Partial<VerificationSession>): Promise<VerificationSession | undefined> {
    const session = this.verificationSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.verificationSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getVerificationSessionByCode(code: string): Promise<VerificationSession | undefined> {
    return Array.from(this.verificationSessions.values()).find(
      (session) => session.verificationCode === code
    );
  }

  async getActiveVerificationSessions(): Promise<VerificationSession[]> {
    const now = new Date();
    return Array.from(this.verificationSessions.values()).filter(
      (session) => session.expiresAt > now
    );
  }

  async getBotConfiguration(id: string): Promise<BotConfiguration | undefined> {
    return this.botConfigurations.get(id);
  }

  async createBotConfiguration(config: InsertBotConfiguration): Promise<BotConfiguration> {
    const id = randomUUID();
    const newConfig: BotConfiguration = {
      id,
      ...config,
      isCompleted: false,
      createdAt: new Date(),
    };
    this.botConfigurations.set(id, newConfig);
    return newConfig;
  }

  async updateBotConfiguration(id: string, updates: Partial<BotConfiguration>): Promise<BotConfiguration | undefined> {
    const config = this.botConfigurations.get(id);
    if (!config) return undefined;
    
    const updatedConfig = { ...config, ...updates };
    this.botConfigurations.set(id, updatedConfig);
    return updatedConfig;
  }

  async getBotConfigurationsBySession(sessionId: string): Promise<BotConfiguration[]> {
    return Array.from(this.botConfigurations.values()).filter(
      (config) => config.sessionId === sessionId
    );
  }

  async getAdminSession(id: string): Promise<AdminSession | undefined> {
    return this.adminSessions.get(id);
  }

  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    const id = randomUUID();
    const newSession: AdminSession = {
      id,
      ...session,
      isActive: true,
      createdAt: new Date(),
    };
    this.adminSessions.set(id, newSession);
    return newSession;
  }

  async getActiveAdminSession(): Promise<AdminSession | undefined> {
    return Array.from(this.adminSessions.values()).find(
      (session) => session.isActive
    );
  }

  async deactivateAdminSession(id: string): Promise<void> {
    const session = this.adminSessions.get(id);
    if (session) {
      session.isActive = false;
      this.adminSessions.set(id, session);
    }
  }

  async getAllSubmissions(): Promise<Array<{
    id: string;
    robloxUsername: string;
    verificationCode: string;
    isVerified: boolean;
    game?: string;
    mode?: string;
    createdAt: Date;
    status: 'pending' | 'verified' | 'failed';
  }>> {
    const sessions = Array.from(this.verificationSessions.values());
    const now = new Date();
    
    return sessions.map(session => {
      const configs = Array.from(this.botConfigurations.values()).filter(
        config => config.sessionId === session.id
      );
      const latestConfig = configs[configs.length - 1];
      
      let status: 'pending' | 'verified' | 'failed' = 'pending';
      if (session.expiresAt < now && !session.isVerified) {
        status = 'failed';
      } else if (session.isVerified) {
        status = 'verified';
      }
      
      return {
        id: session.id,
        robloxUsername: session.robloxUsername,
        verificationCode: session.verificationCode,
        isVerified: session.isVerified,
        game: latestConfig?.game,
        mode: latestConfig?.mode,
        createdAt: session.createdAt || new Date(),
        status,
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
