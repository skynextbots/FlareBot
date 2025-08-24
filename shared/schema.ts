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
