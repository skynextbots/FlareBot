import {
  type User, type InsertUser,
  type VerificationSession, type InsertVerificationSession,
  type BotConfiguration, type InsertBotConfiguration,
  type AdminSession, type InsertAdminSession,
  type KeySubmission, type InsertKeySubmission,
  type BotStatus, type InsertBotStatus,
  type AccessRequest, type InsertAccessRequest,
  type UserProfile, type InsertUserProfile,
  type SessionHistory, type InsertSessionHistory,
  type BotQueue, type InsertBotQueue,
  type Notification, type InsertNotification,
  type Maintenance, type InsertMaintenance,
  type SystemStats
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

  // Access request methods
  createAccessRequest(request: InsertAccessRequest): Promise<AccessRequest>;
  getAccessRequest(id: string): Promise<AccessRequest | undefined>;
  getAccessRequestBySession(sessionId: string): Promise<AccessRequest | undefined>;
  approveAccessRequest(id: string, accessLink: string): Promise<AccessRequest | undefined>;

  // User profile methods
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getUserProfile(robloxUsername: string): Promise<UserProfile | undefined>;
  updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined>;
  getAllUserProfiles(): Promise<UserProfile[]>;
  incrementUserSessions(profileId: string): Promise<void>;
  updateUserPlayTime(profileId: string, minutes: number): Promise<void>;

  // Session history methods
  createSessionHistory(session: InsertSessionHistory): Promise<SessionHistory>;
  getSessionHistory(profileId: string, limit?: number): Promise<SessionHistory[]>;
  getSessionById(id: string): Promise<SessionHistory | undefined>;
  updateSessionHistory(id: string, updates: Partial<SessionHistory>): Promise<SessionHistory | undefined>;
  getTopRatedSessions(): Promise<SessionHistory[]>;

  // Bot queue methods
  addToQueue(queue: InsertBotQueue): Promise<BotQueue>;
  getQueuePosition(profileId: string, botName: string): Promise<number>;
  getNextInQueue(botName: string): Promise<BotQueue | undefined>;
  removeFromQueue(id: string): Promise<void>;
  updateQueuePositions(botName: string): Promise<void>;
  getMyQueueStatus(profileId: string): Promise<BotQueue[]>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(profileId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(profileId: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;

  // Analytics and stats methods
  getSystemStats(): Promise<SystemStats | undefined>;
  updateSystemStats(stats: Partial<SystemStats>): Promise<void>;
  getDashboardAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    botUtilization: Record<string, number>;
    popularGames: Array<{ name: string; count: number }>;
    recentSessions: number;
  }>;

  // Maintenance methods
  createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance>;
  getActiveMaintenance(): Promise<Maintenance[]>;
  getUpcomingMaintenance(): Promise<Maintenance[]>;
  updateMaintenance(id: string, updates: Partial<Maintenance>): Promise<Maintenance | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private verificationSessions: Map<string, VerificationSession>;
  private botConfigurations: Map<string, BotConfiguration>;
  private adminSessions: Map<string, AdminSession>;
  private keySubmissions: Map<string, KeySubmission>;
  private botStatuses: Map<string, BotStatus>;
  private accessRequests: Map<string, AccessRequest>;
  private userProfiles: Map<string, UserProfile>;
  private sessionHistory: Map<string, SessionHistory>;
  private botQueue: Map<string, BotQueue>;
  private notifications: Map<string, Notification>;
  private maintenance: Map<string, Maintenance>;
  private systemStats: SystemStats | null;

  constructor() {
    this.users = new Map();
    this.verificationSessions = new Map();
    this.botConfigurations = new Map();
    this.adminSessions = new Map();
    this.keySubmissions = new Map();
    this.botStatuses = new Map();
    this.accessRequests = new Map();
    this.userProfiles = new Map();
    this.sessionHistory = new Map();
    this.botQueue = new Map();
    this.notifications = new Map();
    this.maintenance = new Map();
    this.systemStats = null;

    // Initialize FlareBot_V1 status and system data
    this.initializeBotStatus();
    this.initializeSystemStats();
    this.initializeSampleData();
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

  private initializeSystemStats() {
    this.systemStats = {
      id: "system-stats-current",
      date: new Date(),
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      botUtilization: {},
      popularGames: [],
      errorRate: 0,
    };
  }

  private initializeSampleData() {
    // Create sample admin user
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      password: "admin123",
      isPasswordSet: true
    };
    this.users.set("admin-1", adminUser);
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
    const user: User = { ...insertUser, id, isPasswordSet: true };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.password) return false;

    // In a real implementation, you would hash and compare passwords
    // For this demo, we'll do a direct comparison
    return user.password === password;
  }

  async getVerificationSession(id: string): Promise<VerificationSession | undefined> {
    return this.verificationSessions.get(id);
  }

  async createVerificationSession(session: InsertVerificationSession): Promise<VerificationSession> {
    const id = randomUUID();

    // Check if user already has a permanent verification code
    const existingUser = await this.getUserByUsername(session.robloxUsername);
    let code: string;

    if (existingUser && existingUser.verificationCode) {
      // Use existing permanent code
      code = existingUser.verificationCode;
    } else {
      // Generate new permanent code for this user
      code = `Verify_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Store the code permanently with the user
      if (existingUser) {
        await this.updateUser(existingUser.id, { verificationCode: code });
      } else {
        // Create user with permanent verification code
        await this.createUser({
          username: session.robloxUsername,
          password: null,
          isPasswordSet: false,
          verificationCode: code
        });
      }
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const newSession: VerificationSession = {
      id,
      ...session,
      verificationCode: code,
      isVerified: false,
      expiresAt,
      verificationAttempts: 0,
      isTimedOut: false,
      timeoutUntil: null,
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

    const timeoutUntil = new Date(Date.now() + minutes * 60 * 1000);
    const updated = { ...session, isTimedOut: true, timeoutUntil };
    this.verificationSessions.set(id, updated);
  }

  async isAccountLocked(id: string): Promise<boolean> {
    const session = this.verificationSessions.get(id);
    if (!session || !session.timeoutUntil) return false;

    return new Date() < session.timeoutUntil;
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

  async createAccessRequest(request: InsertAccessRequest): Promise<AccessRequest> {
    const id = randomUUID();
    const newRequest: AccessRequest = {
      id,
      sessionId: request.sessionId || null,
      status: request.status || "pending",
      accessLink: request.accessLink || null,
      requestTime: new Date(),
      approvalTime: null,
      createdAt: new Date(),
    };
    this.accessRequests.set(id, newRequest);
    return newRequest;
  }

  async getAccessRequest(id: string): Promise<AccessRequest | undefined> {
    return this.accessRequests.get(id);
  }

  async getAccessRequestBySession(sessionId: string): Promise<AccessRequest | undefined> {
    return Array.from(this.accessRequests.values()).find(
      (request) => request.sessionId === sessionId
    );
  }

  async approveAccessRequest(id: string, accessLink: string): Promise<AccessRequest | undefined> {
    const request = this.accessRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = {
      ...request,
      status: "approved",
      accessLink,
      approvalTime: new Date(),
    };
    this.accessRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // User Profile Methods
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const newProfile: UserProfile = {
      id,
      robloxUsername: profile.robloxUsername,
      displayName: profile.displayName || null,
      bio: profile.bio || null,
      favoriteGames: profile.favoriteGames || [],
      preferredModes: profile.preferredModes || [],
      totalSessions: 0,
      totalPlayTime: 0,
      lastActiveAt: new Date(),
      joinedAt: new Date(),
      isVip: false,
      reputation: 0,
      preferences: profile.preferences || null,
    };
    this.userProfiles.set(id, newProfile);
    return newProfile;
  }

  async getUserProfile(robloxUsername: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.robloxUsername === robloxUsername
    );
  }

  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const profile = this.userProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...updates, lastActiveAt: new Date() };
    this.userProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getAllUserProfiles(): Promise<UserProfile[]> {
    return Array.from(this.userProfiles.values()).sort(
      (a, b) => (b.totalSessions || 0) - (a.totalSessions || 0)
    );
  }

  async incrementUserSessions(profileId: string): Promise<void> {
    const profile = this.userProfiles.get(profileId);
    if (profile) {
      profile.totalSessions = (profile.totalSessions || 0) + 1;
      profile.lastActiveAt = new Date();
      this.userProfiles.set(profileId, profile);
    }
  }

  async updateUserPlayTime(profileId: string, minutes: number): Promise<void> {
    const profile = this.userProfiles.get(profileId);
    if (profile) {
      profile.totalPlayTime = (profile.totalPlayTime || 0) + minutes;
      this.userProfiles.set(profileId, profile);
    }
  }

  // Session History Methods
  async createSessionHistory(session: InsertSessionHistory): Promise<SessionHistory> {
    const id = randomUUID();
    const newSession: SessionHistory = {
      id,
      profileId: session.profileId || null,
      botName: session.botName,
      game: session.game,
      mode: session.mode,
      duration: session.duration || null,
      rating: session.rating || null,
      feedback: session.feedback || null,
      startTime: session.startTime,
      endTime: session.endTime || null,
      status: session.status || "completed",
    };
    this.sessionHistory.set(id, newSession);
    return newSession;
  }

  async getSessionHistory(profileId: string, limit = 10): Promise<SessionHistory[]> {
    return Array.from(this.sessionHistory.values())
      .filter((session) => session.profileId === profileId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async getSessionById(id: string): Promise<SessionHistory | undefined> {
    return this.sessionHistory.get(id);
  }

  async updateSessionHistory(id: string, updates: Partial<SessionHistory>): Promise<SessionHistory | undefined> {
    const session = this.sessionHistory.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.sessionHistory.set(id, updatedSession);
    return updatedSession;
  }

  async getTopRatedSessions(): Promise<SessionHistory[]> {
    return Array.from(this.sessionHistory.values())
      .filter((session) => session.rating && session.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }

  // Bot Queue Methods
  async addToQueue(queue: InsertBotQueue): Promise<BotQueue> {
    const id = randomUUID();
    const position = Array.from(this.botQueue.values())
      .filter(q => q.botName === queue.botName && q.status === "waiting").length + 1;

    const newQueue: BotQueue = {
      id,
      profileId: queue.profileId || null,
      botName: queue.botName,
      game: queue.game,
      mode: queue.mode,
      priority: queue.priority || 0,
      estimatedWaitTime: position * 10, // 10 minutes per position
      queuePosition: position,
      queuedAt: new Date(),
      status: "waiting",
    };
    this.botQueue.set(id, newQueue);
    return newQueue;
  }

  async getQueuePosition(profileId: string, botName: string): Promise<number> {
    const userQueue = Array.from(this.botQueue.values()).find(
      q => q.profileId === profileId && q.botName === botName && q.status === "waiting"
    );
    return userQueue?.queuePosition || 0;
  }

  async getNextInQueue(botName: string): Promise<BotQueue | undefined> {
    return Array.from(this.botQueue.values())
      .filter(q => q.botName === botName && q.status === "waiting")
      .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0))[0];
  }

  async removeFromQueue(id: string): Promise<void> {
    this.botQueue.delete(id);
  }

  async updateQueuePositions(botName: string): Promise<void> {
    const queueItems = Array.from(this.botQueue.values())
      .filter(q => q.botName === botName && q.status === "waiting")
      .sort((a, b) => (a.queuedAt?.getTime() || 0) - (b.queuedAt?.getTime() || 0));

    queueItems.forEach((item, index) => {
      item.queuePosition = index + 1;
      item.estimatedWaitTime = (index + 1) * 10;
      this.botQueue.set(item.id, item);
    });
  }

  async getMyQueueStatus(profileId: string): Promise<BotQueue[]> {
    return Array.from(this.botQueue.values())
      .filter(q => q.profileId === profileId)
      .sort((a, b) => (a.queuedAt?.getTime() || 0) - (b.queuedAt?.getTime() || 0));
  }

  // Notification Methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      id,
      profileId: notification.profileId || null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: false,
      actionUrl: notification.actionUrl || null,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(profileId: string, unreadOnly = false): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.profileId === profileId && (!unreadOnly || !n.isRead))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async markAllNotificationsRead(profileId: string): Promise<void> {
    Array.from(this.notifications.values())
      .filter(n => n.profileId === profileId)
      .forEach(n => {
        n.isRead = true;
        this.notifications.set(n.id, n);
      });
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications.delete(id);
  }

  // Analytics and Stats Methods
  async getSystemStats(): Promise<SystemStats | undefined> {
    return this.systemStats || undefined;
  }

  async updateSystemStats(stats: Partial<SystemStats>): Promise<void> {
    if (this.systemStats) {
      this.systemStats = { ...this.systemStats, ...stats };
    }
  }

  async getDashboardAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    botUtilization: Record<string, number>;
    popularGames: Array<{ name: string; count: number }>;
    recentSessions: number;
  }> {
    const totalUsers = this.userProfiles.size;
    const activeUsers = Array.from(this.userProfiles.values())
      .filter(p => p.lastActiveAt && (Date.now() - p.lastActiveAt.getTime()) < 24 * 60 * 60 * 1000).length;

    const botUtilization: Record<string, number> = {};
    Array.from(this.botStatuses.values()).forEach(bot => {
      botUtilization[bot.botName] = bot.isInUse ? 100 : 0;
    });

    const gameCount: Record<string, number> = {};
    Array.from(this.sessionHistory.values()).forEach(session => {
      if (session.game) { // Ensure session.game is not undefined
        gameCount[session.game] = (gameCount[session.game] || 0) + 1;
      }
    });

    const popularGames = Object.entries(gameCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentSessions = Array.from(this.sessionHistory.values())
      .filter(s => s.startTime && (Date.now() - s.startTime.getTime()) < 24 * 60 * 60 * 1000).length;

    return {
      totalUsers,
      activeUsers,
      botUtilization,
      popularGames,
      recentSessions,
    };
  }

  // Maintenance Methods
  async createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance> {
    const id = randomUUID();
    const newMaintenance: Maintenance = {
      id,
      title: maintenance.title,
      description: maintenance.description || null,
      startTime: maintenance.startTime,
      endTime: maintenance.endTime,
      affectedBots: maintenance.affectedBots || [],
      isActive: false,
      createdBy: maintenance.createdBy,
      createdAt: new Date(),
    };
    this.maintenance.set(id, newMaintenance);
    return newMaintenance;
  }

  async getActiveMaintenance(): Promise<Maintenance[]> {
    const now = new Date();
    return Array.from(this.maintenance.values()).filter(
      m => m.startTime <= now && m.endTime >= now
    );
  }

  async getUpcomingMaintenance(): Promise<Maintenance[]> {
    const now = new Date();
    return Array.from(this.maintenance.values())
      .filter(m => m.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async updateMaintenance(id: string, updates: Partial<Maintenance>): Promise<Maintenance | undefined> {
    const maintenance = this.maintenance.get(id);
    if (!maintenance) return undefined;

    const updatedMaintenance = { ...maintenance, ...updates };
    this.maintenance.set(id, updatedMaintenance);
    return updatedMaintenance;
  }
}

export const storage = new MemStorage();