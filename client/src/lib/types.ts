export interface VerificationSession {
  sessionId: string;
  verificationCode: string;
  expiresAt: string;
  robloxUsername: string;
  isVerified?: boolean;
  skipVerification?: boolean;
}

export interface BotConfiguration {
  id: string;
  sessionId: string;
  game: string;
  mode: string;
  additionalSettings?: string;
  isCompleted: boolean;
}

export interface AdminSession {
  sessionId: string;
  username: string;
}

export interface DashboardStats {
  activeUsers: number;
  pendingVerifications: number;
  botConfigs: number;
  systemUptime: string;
}

export interface Submission {
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
  sessionStartTime?: string;
  sessionEndTime?: string;
  createdAt: string;
  status: 'pending' | 'verified' | 'failed';
}

export interface KeySubmission {
  id: string;
  sessionId: string;
  accessKey: string;
  submittedKey?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_use';
  adminApprovalTime?: string;
  gameAccessTime?: string;
  nextIntentTime?: string;
  createdAt: string;
}

export interface BotStatus {
  id: string;
  botName: string;
  isInUse: boolean;
  currentUser?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  lastUpdated: string;
}
