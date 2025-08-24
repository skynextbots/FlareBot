export interface VerificationSession {
  sessionId: string;
  verificationCode: string;
  expiresAt: string;
  robloxUsername: string;
  isVerified?: boolean;
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
  createdAt: string;
  status: 'pending' | 'verified' | 'failed';
}
