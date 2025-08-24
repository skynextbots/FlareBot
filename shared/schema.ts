import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const verificationSessions = pgTable("verification_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  robloxUsername: text("roblox_username").notNull(),
  verificationCode: text("verification_code").notNull(),
  isVerified: boolean("is_verified").default(false),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVerificationSession = z.infer<typeof insertVerificationSessionSchema>;
export type VerificationSession = typeof verificationSessions.$inferSelect;

export type InsertBotConfiguration = z.infer<typeof insertBotConfigurationSchema>;
export type BotConfiguration = typeof botConfigurations.$inferSelect;

export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
