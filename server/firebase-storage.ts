import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase-config';
import { IStorage } from './storage';
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

export class FirebaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Initialize FlareBot_V1 status
    const botStatusRef = doc(db, 'botStatuses', 'FlareBot_V1');
    const botStatusSnap = await getDoc(botStatusRef);
    
    if (!botStatusSnap.exists()) {
      await setDoc(botStatusRef, {
        id: "flarebot-v1",
        botName: "FlareBot_V1",
        isInUse: false,
        currentUser: null,
        sessionStartTime: null,
        sessionEndTime: null,
        lastUpdated: serverTimestamp(),
      });
    }

    // Initialize admin user
    const adminUserRef = doc(db, 'users', 'admin-1');
    const adminUserSnap = await getDoc(adminUserRef);
    
    if (!adminUserSnap.exists()) {
      await setDoc(adminUserRef, {
        id: "admin-1",
        username: "admin",
        password: "admin123",
        isPasswordSet: true,
        verificationCode: null
      });
    }
  }

  private convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return timestamp || new Date();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
      } as User;
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as User;
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const docRef = doc(collection(db, 'users'));
    const newUser = {
      ...user,
      id: docRef.id,
      isPasswordSet: true
    };
    
    await setDoc(docRef, newUser);
    return newUser;
  }

  // Verification session methods
  async getVerificationSession(id: string): Promise<VerificationSession | undefined> {
    const docRef = doc(db, 'verificationSessions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        expiresAt: this.convertTimestamp(data.expiresAt),
        createdAt: this.convertTimestamp(data.createdAt),
        timeoutUntil: data.timeoutUntil ? this.convertTimestamp(data.timeoutUntil) : null,
      } as VerificationSession;
    }
    return undefined;
  }

  async createVerificationSession(session: InsertVerificationSession): Promise<VerificationSession> {
    // Check if user already has a permanent verification code
    const existingUser = await this.getUserByUsername(session.robloxUsername);
    let code: string;

    if (existingUser && existingUser.verificationCode) {
      code = existingUser.verificationCode;
    } else {
      code = `Verify_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      if (existingUser) {
        await updateDoc(doc(db, 'users', existingUser.id), { verificationCode: code });
      } else {
        await this.createUser({
          username: session.robloxUsername,
          password: null,
          isPasswordSet: false,
          verificationCode: code
        });
      }
    }

    const docRef = doc(collection(db, 'verificationSessions'));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const newSession = {
      id: docRef.id,
      ...session,
      verificationCode: code,
      isVerified: false,
      expiresAt: Timestamp.fromDate(expiresAt),
      verificationAttempts: 0,
      isTimedOut: false,
      timeoutUntil: null,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(docRef, newSession);
    
    return {
      ...newSession,
      expiresAt,
      createdAt: new Date(),
      timeoutUntil: null,
    } as VerificationSession;
  }

  async updateVerificationSession(id: string, updates: Partial<VerificationSession>): Promise<VerificationSession | undefined> {
    const docRef = doc(db, 'verificationSessions', id);
    
    // Convert Date objects to Timestamps for Firebase
    const firebaseUpdates: any = { ...updates };
    if (updates.expiresAt) {
      firebaseUpdates.expiresAt = Timestamp.fromDate(updates.expiresAt);
    }
    if (updates.timeoutUntil) {
      firebaseUpdates.timeoutUntil = Timestamp.fromDate(updates.timeoutUntil);
    }
    
    await updateDoc(docRef, firebaseUpdates);
    return this.getVerificationSession(id);
  }

  async getVerificationSessionByCode(code: string): Promise<VerificationSession | undefined> {
    const q = query(collection(db, 'verificationSessions'), where('verificationCode', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        expiresAt: this.convertTimestamp(data.expiresAt),
        createdAt: this.convertTimestamp(data.createdAt),
        timeoutUntil: data.timeoutUntil ? this.convertTimestamp(data.timeoutUntil) : null,
      } as VerificationSession;
    }
    return undefined;
  }

  async getActiveVerificationSessions(): Promise<VerificationSession[]> {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'verificationSessions'), 
      where('expiresAt', '>', now)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        expiresAt: this.convertTimestamp(data.expiresAt),
        createdAt: this.convertTimestamp(data.createdAt),
        timeoutUntil: data.timeoutUntil ? this.convertTimestamp(data.timeoutUntil) : null,
      } as VerificationSession;
    });
  }

  async incrementVerificationAttempts(id: string): Promise<number> {
    const session = await this.getVerificationSession(id);
    if (!session) return 0;

    const attempts = (session.verificationAttempts || 0) + 1;
    await this.updateVerificationSession(id, { verificationAttempts: attempts });
    return attempts;
  }

  async lockAccountTemporarily(id: string, minutes: number): Promise<void> {
    const timeoutUntil = new Date(Date.now() + minutes * 60 * 1000);
    await this.updateVerificationSession(id, { 
      isTimedOut: true, 
      timeoutUntil 
    });
  }

  async isAccountLocked(id: string): Promise<boolean> {
    const session = await this.getVerificationSession(id);
    if (!session || !session.timeoutUntil) return false;
    return new Date() < session.timeoutUntil;
  }

  // Bot configuration methods
  async getBotConfiguration(id: string): Promise<BotConfiguration | undefined> {
    const docRef = doc(db, 'botConfigurations', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: this.convertTimestamp(data.createdAt),
      } as BotConfiguration;
    }
    return undefined;
  }

  async createBotConfiguration(config: InsertBotConfiguration): Promise<BotConfiguration> {
    const docRef = doc(collection(db, 'botConfigurations'));
    const newConfig = {
      id: docRef.id,
      sessionId: config.sessionId || null,
      game: config.game,
      mode: config.mode,
      additionalSettings: config.additionalSettings || null,
      isCompleted: false,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(docRef, newConfig);
    
    return {
      ...newConfig,
      createdAt: new Date(),
    } as BotConfiguration;
  }

  async updateBotConfiguration(id: string, updates: Partial<BotConfiguration>): Promise<BotConfiguration | undefined> {
    const docRef = doc(db, 'botConfigurations', id);
    await updateDoc(docRef, updates);
    return this.getBotConfiguration(id);
  }

  async getBotConfigurationsBySession(sessionId: string): Promise<BotConfiguration[]> {
    const q = query(collection(db, 'botConfigurations'), where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: this.convertTimestamp(data.createdAt),
      } as BotConfiguration;
    });
  }

  // Admin session methods
  async getAdminSession(id: string): Promise<AdminSession | undefined> {
    const docRef = doc(db, 'adminSessions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: this.convertTimestamp(data.createdAt),
      } as AdminSession;
    }
    return undefined;
  }

  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    const docRef = doc(collection(db, 'adminSessions'));
    const newSession = {
      id: docRef.id,
      ...session,
      isActive: true,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(docRef, newSession);
    
    return {
      ...newSession,
      createdAt: new Date(),
    } as AdminSession;
  }

  async getActiveAdminSession(): Promise<AdminSession | undefined> {
    const q = query(collection(db, 'adminSessions'), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: this.convertTimestamp(data.createdAt),
      } as AdminSession;
    }
    return undefined;
  }

  async deactivateAdminSession(id: string): Promise<void> {
    const docRef = doc(db, 'adminSessions', id);
    await updateDoc(docRef, { isActive: false });
  }

  // For the remaining methods, I'll provide simplified implementations
  // You can extend these based on your specific needs

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
    const q = query(collection(db, 'verificationSessions'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const now = new Date();
      const expiresAt = this.convertTimestamp(data.expiresAt);
      
      let status: 'pending' | 'verified' | 'failed' = 'pending';
      if (expiresAt < now && !data.isVerified) {
        status = 'failed';
      } else if (data.isVerified) {
        status = 'verified';
      }
      
      return {
        id: doc.id,
        robloxUsername: data.robloxUsername,
        verificationCode: data.verificationCode,
        isVerified: data.isVerified || false,
        createdAt: this.convertTimestamp(data.createdAt),
        status,
      };
    });
  }

  // Key submission methods
  async createKeySubmission(submission: InsertKeySubmission): Promise<KeySubmission> {
    const docRef = doc(collection(db, 'keySubmissions'));
    const accessKey = `FK_${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
    
    const newSubmission = {
      id: docRef.id,
      sessionId: submission.sessionId || null,
      submittedKey: submission.submittedKey || null,
      accessKey,
      status: "pending",
      adminApprovalTime: null,
      gameAccessTime: null,
      nextIntentTime: null,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(docRef, newSubmission);
    
    return {
      ...newSubmission,
      createdAt: new Date(),
      adminApprovalTime: null,
      gameAccessTime: null,
      nextIntentTime: null,
    } as KeySubmission;
  }

  async getKeySubmission(id: string): Promise<KeySubmission | undefined> {
    const docRef = doc(db, 'keySubmissions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: this.convertTimestamp(data.createdAt),
        adminApprovalTime: data.adminApprovalTime ? this.convertTimestamp(data.adminApprovalTime) : null,
        gameAccessTime: data.gameAccessTime ? this.convertTimestamp(data.gameAccessTime) : null,
        nextIntentTime: data.nextIntentTime ? this.convertTimestamp(data.nextIntentTime) : null,
      } as KeySubmission;
    }
    return undefined;
  }

  async getKeySubmissionBySession(sessionId: string): Promise<KeySubmission | undefined> {
    const q = query(collection(db, 'keySubmissions'), where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: this.convertTimestamp(data.createdAt),
        adminApprovalTime: data.adminApprovalTime ? this.convertTimestamp(data.adminApprovalTime) : null,
        gameAccessTime: data.gameAccessTime ? this.convertTimestamp(data.gameAccessTime) : null,
        nextIntentTime: data.nextIntentTime ? this.convertTimestamp(data.nextIntentTime) : null,
      } as KeySubmission;
    }
    return undefined;
  }

  async updateKeySubmission(id: string, updates: Partial<KeySubmission>): Promise<KeySubmission | undefined> {
    const docRef = doc(db, 'keySubmissions', id);
    
    // Convert Date objects to Timestamps
    const firebaseUpdates: any = { ...updates };
    if (updates.adminApprovalTime) {
      firebaseUpdates.adminApprovalTime = Timestamp.fromDate(updates.adminApprovalTime);
    }
    if (updates.gameAccessTime) {
      firebaseUpdates.gameAccessTime = Timestamp.fromDate(updates.gameAccessTime);
    }
    if (updates.nextIntentTime) {
      firebaseUpdates.nextIntentTime = Timestamp.fromDate(updates.nextIntentTime);
    }
    
    await updateDoc(docRef, firebaseUpdates);
    return this.getKeySubmission(id);
  }

  async approveKeySubmission(id: string): Promise<KeySubmission | undefined> {
    const nextIntentTime = new Date(Date.now() + 10 * 60 * 1000);
    return this.updateKeySubmission(id, {
      status: "accepted",
      adminApprovalTime: new Date(),
      gameAccessTime: new Date(),
      nextIntentTime
    });
  }

  // Bot status methods
  async getBotStatus(botName: string): Promise<BotStatus | undefined> {
    const docRef = doc(db, 'botStatuses', botName);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        lastUpdated: this.convertTimestamp(data.lastUpdated),
        sessionStartTime: data.sessionStartTime ? this.convertTimestamp(data.sessionStartTime) : null,
        sessionEndTime: data.sessionEndTime ? this.convertTimestamp(data.sessionEndTime) : null,
      } as BotStatus;
    }
    return undefined;
  }

  async updateBotStatus(botName: string, updates: Partial<BotStatus>): Promise<BotStatus> {
    const docRef = doc(db, 'botStatuses', botName);
    
    const firebaseUpdates: any = { 
      ...updates, 
      lastUpdated: serverTimestamp() 
    };
    
    if (updates.sessionStartTime) {
      firebaseUpdates.sessionStartTime = Timestamp.fromDate(updates.sessionStartTime);
    }
    if (updates.sessionEndTime) {
      firebaseUpdates.sessionEndTime = Timestamp.fromDate(updates.sessionEndTime);
    }
    
    await updateDoc(docRef, firebaseUpdates);
    
    const updated = await this.getBotStatus(botName);
    return updated!;
  }

  async setBotInUse(botName: string, username: string): Promise<BotStatus> {
    const sessionEndTime = new Date(Date.now() + 10 * 60 * 1000);
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
    const querySnapshot = await getDocs(collection(db, 'botStatuses'));
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        lastUpdated: this.convertTimestamp(data.lastUpdated),
        sessionStartTime: data.sessionStartTime ? this.convertTimestamp(data.sessionStartTime) : null,
        sessionEndTime: data.sessionEndTime ? this.convertTimestamp(data.sessionEndTime) : null,
      } as BotStatus;
    });
  }

  // Access request methods
  async createAccessRequest(request: InsertAccessRequest): Promise<AccessRequest> {
    const docRef = doc(collection(db, 'accessRequests'));
    const newRequest = {
      id: docRef.id,
      sessionId: request.sessionId || null,
      status: request.status || "pending",
      accessLink: request.accessLink || null,
      requestTime: serverTimestamp(),
      approvalTime: null,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(docRef, newRequest);
    
    return {
      ...newRequest,
      requestTime: new Date(),
      approvalTime: null,
      createdAt: new Date(),
    } as AccessRequest;
  }

  async getAccessRequest(id: string): Promise<AccessRequest | undefined> {
    const docRef = doc(db, 'accessRequests', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        requestTime: this.convertTimestamp(data.requestTime),
        approvalTime: data.approvalTime ? this.convertTimestamp(data.approvalTime) : null,
        createdAt: this.convertTimestamp(data.createdAt),
      } as AccessRequest;
    }
    return undefined;
  }

  async getAccessRequestBySession(sessionId: string): Promise<AccessRequest | undefined> {
    const q = query(collection(db, 'accessRequests'), where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        requestTime: this.convertTimestamp(data.requestTime),
        approvalTime: data.approvalTime ? this.convertTimestamp(data.approvalTime) : null,
        createdAt: this.convertTimestamp(data.createdAt),
      } as AccessRequest;
    }
    return undefined;
  }

  async approveAccessRequest(id: string, accessLink: string): Promise<AccessRequest | undefined> {
    const docRef = doc(db, 'accessRequests', id);
    await updateDoc(docRef, {
      status: "approved",
      accessLink,
      approvalTime: serverTimestamp(),
    });
    return this.getAccessRequest(id);
  }

  // Placeholder implementations for remaining methods
  // You can implement these as needed for your application

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    // Implement based on your needs
    throw new Error("Method not implemented.");
  }

  async getUserProfile(robloxUsername: string): Promise<UserProfile | undefined> {
    throw new Error("Method not implemented.");
  }

  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    throw new Error("Method not implemented.");
  }

  async getAllUserProfiles(): Promise<UserProfile[]> {
    throw new Error("Method not implemented.");
  }

  async incrementUserSessions(profileId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async updateUserPlayTime(profileId: string, minutes: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async createSessionHistory(session: InsertSessionHistory): Promise<SessionHistory> {
    throw new Error("Method not implemented.");
  }

  async getSessionHistory(profileId: string, limit?: number): Promise<SessionHistory[]> {
    throw new Error("Method not implemented.");
  }

  async getSessionById(id: string): Promise<SessionHistory | undefined> {
    throw new Error("Method not implemented.");
  }

  async updateSessionHistory(id: string, updates: Partial<SessionHistory>): Promise<SessionHistory | undefined> {
    throw new Error("Method not implemented.");
  }

  async getTopRatedSessions(): Promise<SessionHistory[]> {
    throw new Error("Method not implemented.");
  }

  async addToQueue(queue: InsertBotQueue): Promise<BotQueue> {
    throw new Error("Method not implemented.");
  }

  async getQueuePosition(profileId: string, botName: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async getNextInQueue(botName: string): Promise<BotQueue | undefined> {
    throw new Error("Method not implemented.");
  }

  async removeFromQueue(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async updateQueuePositions(botName: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getMyQueueStatus(profileId: string): Promise<BotQueue[]> {
    throw new Error("Method not implemented.");
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    throw new Error("Method not implemented.");
  }

  async getUserNotifications(profileId: string, unreadOnly?: boolean): Promise<Notification[]> {
    throw new Error("Method not implemented.");
  }

  async markNotificationRead(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async markAllNotificationsRead(profileId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async deleteNotification(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getSystemStats(): Promise<SystemStats | undefined> {
    throw new Error("Method not implemented.");
  }

  async updateSystemStats(stats: Partial<SystemStats>): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getDashboardAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    botUtilization: Record<string, number>;
    popularGames: Array<{ name: string; count: number }>;
    recentSessions: number;
  }> {
    throw new Error("Method not implemented.");
  }

  async createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance> {
    throw new Error("Method not implemented.");
  }

  async getActiveMaintenance(): Promise<Maintenance[]> {
    throw new Error("Method not implemented.");
  }

  async getUpcomingMaintenance(): Promise<Maintenance[]> {
    throw new Error("Method not implemented.");
  }

  async updateMaintenance(id: string, updates: Partial<Maintenance>): Promise<Maintenance | undefined> {
    throw new Error("Method not implemented.");
  }
}