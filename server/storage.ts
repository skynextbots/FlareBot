import {
  type User, type InsertUser,
  type VerificationSession, type InsertVerificationSession,
  type BotConfiguration, type InsertBotConfiguration,
  type AdminSession, type InsertAdminSession,
  type KeySubmission, type InsertKeySubmission,
  type BotStatus, type InsertBotStatus
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
  incrementVerificationAttempts(id: string): Promise<number>;
  lockAccountTemporarily(id: string, minutes: number): Promise<void>;
  isAccountLocked(id: string): Promise<boolean>;

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

  // Key submission methods
  createKeySubmission(submission: InsertKeySubmission): Promise<KeySubmission>;
  getKeySubmission(id: string): Promise<KeySubmission | undefined>;
  getKeySubmissionBySession(sessionId: string): Promise<KeySubmission | undefined>;
  updateKeySubmission(id: string, updates: Partial<KeySubmission>): Promise<KeySubmission | undefined>;
  approveKeySubmission(id: string): Promise<KeySubmission | undefined>;

  // Bot status methods
  getBotStatus(botName: string): Promise<BotStatus | undefined>;
  updateBotStatus(botName: string, updates: Partial<BotStatus>): Promise<BotStatus>;
  setBotInUse(botName: string, username: string): Promise<BotStatus>;
  setBotAvailable(botName: string): Promise<BotStatus>;
  getAllBotStatuses(): Promise<BotStatus[]>;

  // Admin dashboard methods
  getAllSubmissions(): Promise<Array<{
    id: string;
    robloxUsername: string;
    verificationCode: string;
    isVerified: boolean;
    game?: string;
    mode?: string;
    additionalSettings?: string;
    submittedKey?: string;
    accessKey?: string;
    keyStatus?: string;
    sessionStartTime?: Date;
    sessionEndTime?: Date;
    createdAt: Date;
    status: 'pending' | 'verified' | 'failed';
  }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private verificationSessions: Map<string, VerificationSession>;
  private botConfigurations: Map<string, BotConfiguration>;
  private adminSessions: Map<string, AdminSession>;
  private keySubmissions: Map<string, KeySubmission>;
  private botStatuses: Map<string, BotStatus>;

  constructor() {
    this.users = new Map();
    this.verificationSessions = new Map();
    this.botConfigurations = new Map();
    this.adminSessions = new Map();
    this.keySubmissions = new Map();
    this.botStatuses = new Map();

    // Initialize FlareBot_V1 status
    this.initializeBotStatus();
  }

  private initializeBotStatus() {
    const botStatus: BotStatus = {
      id: "flarebot-v1",
      botName: "FlareBot_V1",
      isInUse: false,
      currentUser: null,
      sessionStartTime: null,
      sessionEndTime: null,
      lastUpdated: new Date(),
    };
    this.botStatuses.set("FlareBot_V1", botStatus);
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
      verificationAttempts: 0, // Initialize attempts
      lockedUntil: null, // Initialize lockedUntil
      createdAt: new Date(),
    };
    this.verificationSessions.set(id, newSession);
    return newSession;
  }

  async updateVerificationSession(id: string, updates: Partial<VerificationSession>): Promise<VerificationSession | undefined> {
    const existing = this.verificationSessions.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.verificationSessions.set(id, updated);
    return updated;
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

  async incrementVerificationAttempts(id: string): Promise<number> {
    const session = this.verificationSessions.get(id);
    if (!session) return 0;

    const attempts = (session.verificationAttempts || 0) + 1;
    const updated = { ...session, verificationAttempts: attempts };
    this.verificationSessions.set(id, updated);
    return attempts;
  }

  async lockAccountTemporarily(id: string, minutes: number): Promise<void> {
    const session = this.verificationSessions.get(id);
    if (!session) return;

    const lockUntil = new Date(Date.now() + minutes * 60 * 1000);
    const updated = { ...session, lockedUntil: lockUntil };
    this.verificationSessions.set(id, updated);
  }

  async isAccountLocked(id: string): Promise<boolean> {
    const session = this.verificationSessions.get(id);
    if (!session || !session.lockedUntil) return false;

    return new Date() < session.lockedUntil;
  }

  async getBotConfiguration(id: string): Promise<BotConfiguration | undefined> {
    return this.botConfigurations.get(id);
  }

  async createBotConfiguration(config: InsertBotConfiguration): Promise<BotConfiguration> {
    const id = randomUUID();
    const newConfig: BotConfiguration = {
      id,
      sessionId: config.sessionId || null,
      game: config.game,
      mode: config.mode,
      additionalSettings: config.additionalSettings || null,
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

      const keySubmissions = Array.from(this.keySubmissions.values()).filter(
        submission => submission.sessionId === session.id
      );
      const latestKeySubmission = keySubmissions[keySubmissions.length - 1];

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
        isVerified: session.isVerified || false,
        game: latestConfig?.game,
        mode: latestConfig?.mode,
        additionalSettings: latestConfig?.additionalSettings,
        submittedKey: latestKeySubmission?.submittedKey,
        accessKey: latestKeySubmission?.accessKey,
        keyStatus: latestKeySubmission?.status,
        sessionStartTime: latestKeySubmission?.gameAccessTime,
        sessionEndTime: latestKeySubmission?.nextIntentTime,
        createdAt: session.createdAt || new Date(),
        status,
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createKeySubmission(submission: InsertKeySubmission): Promise<KeySubmission> {
    const id = randomUUID();
    const accessKey = `FK_${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
    const newSubmission: KeySubmission = {
      id,
      sessionId: submission.sessionId || null,
      submittedKey: submission.submittedKey || null,
      accessKey,
      status: "pending",
      adminApprovalTime: null,
      gameAccessTime: null,
      nextIntentTime: null,
      createdAt: new Date(),
    };
    this.keySubmissions.set(id, newSubmission);
    return newSubmission;
  }

  async getKeySubmission(id: string): Promise<KeySubmission | undefined> {
    return this.keySubmissions.get(id);
  }

  async getKeySubmissionBySession(sessionId: string): Promise<KeySubmission | undefined> {
    return Array.from(this.keySubmissions.values()).find(
      (submission) => submission.sessionId === sessionId
    );
  }

  async updateKeySubmission(id: string, updates: Partial<KeySubmission>): Promise<KeySubmission | undefined> {
    const submission = this.keySubmissions.get(id);
    if (!submission) return undefined;

    const updatedSubmission = { ...submission, ...updates };
    this.keySubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async approveKeySubmission(id: string): Promise<KeySubmission | undefined> {
    const submission = this.keySubmissions.get(id);
    if (!submission) return undefined;

    const nextIntentTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const updatedSubmission = {
      ...submission,
      status: "accepted",
      adminApprovalTime: new Date(),
      gameAccessTime: new Date(),
      nextIntentTime
    };
    this.keySubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async getBotStatus(botName: string): Promise<BotStatus | undefined> {
    return this.botStatuses.get(botName);
  }

  async updateBotStatus(botName: string, updates: Partial<BotStatus>): Promise<BotStatus> {
    const existing = this.botStatuses.get(botName);
    const updated: BotStatus = {
      ...existing,
      ...updates,
      lastUpdated: new Date(),
    } as BotStatus;
    this.botStatuses.set(botName, updated);
    return updated;
  }

  async setBotInUse(botName: string, username: string): Promise<BotStatus> {
    const sessionEndTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    return this.updateBotStatus(botName, {
      isInUse: true,
      currentUser: username,
      sessionStartTime: new Date(),
      sessionEndTime,
    });
  }

  async setBotAvailable(botName: string): Promise<BotStatus> {
    return this.updateBotStatus(botName, {
      isInUse: false,
      currentUser: null,
      sessionStartTime: null,
      sessionEndTime: null,
    });
  }

  async getAllBotStatuses(): Promise<BotStatus[]> {
    return Array.from(this.botStatuses.values());
  }
}

export const storage = new MemStorage();