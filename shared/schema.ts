import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Existing field
  isPasswordSet: boolean("is_password_set").default(false), // New field for tracking if a password is set
});

export const verificationSessions = pgTable("verification_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  robloxUsername: text("roblox_username").notNull(),
  verificationCode: text("verification_code").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationAttempts: integer("verification_attempts").default(0),
  isTimedOut: boolean("is_timed_out").default(false),
  timeoutUntil: timestamp("timeout_until"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const botConfigurations = pgTable("bot_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => verificationSessions.id),
  game: text("game").notNull(),
  mode: text("mode").notNull(),
  additionalSettings: text("additional_settings"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const keySubmissions = pgTable("key_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => verificationSessions.id),
  accessKey: text("access_key").notNull(),
  submittedKey: text("submitted_key"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, in_use
  adminApprovalTime: timestamp("admin_approval_time"),
  gameAccessTime: timestamp("game_access_time"),
  nextIntentTime: timestamp("next_intent_time"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const botStatus = pgTable("bot_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botName: text("bot_name").notNull().unique(),
  isInUse: boolean("is_in_use").default(false),
  currentUser: text("current_user"),
  sessionStartTime: timestamp("session_start_time"),
  sessionEndTime: timestamp("session_end_time"),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const accessRequests = pgTable("access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => verificationSessions.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  accessLink: text("access_link"),
  requestTime: timestamp("request_time").default(sql`now()`),
  approvalTime: timestamp("approval_time"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  robloxUsername: text("roblox_username").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  favoriteGames: text("favorite_games").array(),
  preferredModes: text("preferred_modes").array(),
  totalSessions: integer("total_sessions").default(0),
  totalPlayTime: integer("total_play_time").default(0), // in minutes
  lastActiveAt: timestamp("last_active_at"),
  joinedAt: timestamp("joined_at").default(sql`now()`),
  isVip: boolean("is_vip").default(false),
  reputation: real("reputation").default(0),
  preferences: json("preferences"),
});

export const sessionHistory = pgTable("session_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => userProfiles.id),
  botName: text("bot_name").notNull(),
  game: text("game").notNull(),
  mode: text("mode").notNull(),
  duration: integer("duration"), // in minutes
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("completed"), // completed, interrupted, cancelled
});

export const botQueue = pgTable("bot_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => userProfiles.id),
  botName: text("bot_name").notNull(),
  game: text("game").notNull(),
  mode: text("mode").notNull(),
  priority: integer("priority").default(0), // VIP users get higher priority
  estimatedWaitTime: integer("estimated_wait_time"), // in minutes
  queuePosition: integer("queue_position"),
  queuedAt: timestamp("queued_at").default(sql`now()`),
  status: text("status").notNull().default("waiting"), // waiting, ready, expired
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => userProfiles.id),
  type: text("type").notNull(), // queue_ready, session_ending, maintenance, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const systemStats = pgTable("system_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  totalSessions: integer("total_sessions").default(0),
  avgSessionDuration: real("avg_session_duration").default(0),
  botUtilization: json("bot_utilization"), // bot usage percentages
  popularGames: json("popular_games"),
  errorRate: real("error_rate").default(0),
});

export const maintenanceSchedule = pgTable("maintenance_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  affectedBots: text("affected_bots").array(),
  isActive: boolean("is_active").default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVerificationSessionSchema = createInsertSchema(verificationSessions).pick({
  robloxUsername: true,
});

export const insertBotConfigurationSchema = createInsertSchema(botConfigurations).pick({
  sessionId: true,
  game: true,
  mode: true,
  additionalSettings: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).pick({
  username: true,
});

export const insertKeySubmissionSchema = createInsertSchema(keySubmissions).pick({
  sessionId: true,
  submittedKey: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).pick({
  botName: true,
  isInUse: true,
  currentUser: true,
});

export const insertAccessRequestSchema = createInsertSchema(accessRequests).pick({
  sessionId: true,
  status: true,
  accessLink: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  robloxUsername: true,
  displayName: true,
  bio: true,
  favoriteGames: true,
  preferredModes: true,
  preferences: true,
});

export const insertSessionHistorySchema = createInsertSchema(sessionHistory).pick({
  profileId: true,
  botName: true,
  game: true,
  mode: true,
  duration: true,
  rating: true,
  feedback: true,
  startTime: true,
  endTime: true,
  status: true,
});

export const insertBotQueueSchema = createInsertSchema(botQueue).pick({
  profileId: true,
  botName: true,
  game: true,
  mode: true,
  priority: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  profileId: true,
  type: true,
  title: true,
  message: true,
  actionUrl: true,
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceSchedule).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  affectedBots: true,
  createdBy: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVerificationSession = z.infer<typeof insertVerificationSessionSchema>;
export type VerificationSession = typeof verificationSessions.$inferSelect;

export type InsertBotConfiguration = z.infer<typeof insertBotConfigurationSchema>;
export type BotConfiguration = typeof botConfigurations.$inferSelect;

export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;

export type InsertKeySubmission = z.infer<typeof insertKeySubmissionSchema>;
export type KeySubmission = typeof keySubmissions.$inferSelect;

export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type BotStatus = typeof botStatus.$inferSelect;

export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type AccessRequest = typeof accessRequests.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertSessionHistory = z.infer<typeof insertSessionHistorySchema>;
export type SessionHistory = typeof sessionHistory.$inferSelect;

export type InsertBotQueue = z.infer<typeof insertBotQueueSchema>;
export type BotQueue = typeof botQueue.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Maintenance = typeof maintenanceSchedule.$inferSelect;

export type SystemStats = typeof systemStats.$inferSelect;
