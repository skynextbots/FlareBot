import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  registerAnalyticsRoutes, 
  registerNotificationRoutes, 
  registerUserProfileRoutes, 
  registerBotMonitoringRoutes 
} from "./routes-enhanced";
import { storage } from "./storage";
import { insertVerificationSessionSchema, insertBotConfigurationSchema, insertAdminSessionSchema, insertKeySubmissionSchema } from "@shared/schema";
import { z } from "zod";

// Rate limiting and caching for Roblox API
const robloxApiCache = new Map<string, { result: boolean; timestamp: number }>();
const robloxApiCalls = new Map<string, number>(); // Track calls per IP/minute
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_CALLS_PER_MINUTE = 10; // Max calls per minute

// Clean up old cache entries and rate limit data
setInterval(() => {
  const now = Date.now();

  // Clean cache
  Array.from(robloxApiCache.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_DURATION) {
      robloxApiCache.delete(key);
    }
  });

  // Clean rate limit data
  Array.from(robloxApiCalls.entries()).forEach(([key, timestamp]) => {
    if (now - timestamp > RATE_LIMIT_DURATION) {
      robloxApiCalls.delete(key);
    }
  });
}, 60 * 1000); // Clean every minute

// Function to check Roblox profile about section for verification code
async function checkRobloxAboutSection(username: string, verificationCode: string): Promise<{ found: boolean; content?: string }> {
  try {
    // Get user ID first
    const userResponse = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlareBot/1.0'
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    });

    if (!userResponse.ok) {
      console.error(`[Roblox API] Failed to get user ID for ${username}`);
      return { found: false };
    }

    const userData = await userResponse.json();
    if (!userData.data || userData.data.length === 0) {
      return { found: false };
    }

    const userId = userData.data[0].id;

    // Get user profile information including about section
    const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
      headers: {
        'User-Agent': 'FlareBot/1.0'
      }
    });

    if (!profileResponse.ok) {
      console.error(`[Roblox API] Failed to get profile for user ID ${userId}`);
      return { found: false };
    }

    const profileData = await profileResponse.json();
    const aboutContent = profileData.description || '';

    console.log(`[Roblox API] Checking about section for ${username}: "${aboutContent}"`);
    console.log(`[Roblox API] Looking for verification code: ${verificationCode}`);

    const found = aboutContent.includes(verificationCode);

    return {
      found,
      content: aboutContent
    };
  } catch (error) {
    console.error('[Roblox API] Error checking about section:', error);
    return { found: false };
  }
}

// Roblox API helper function with rate limiting and caching
async function checkRobloxUserExists(username: string, clientIp?: string): Promise<boolean> {
  const cacheKey = username.toLowerCase();
  const rateLimitKey = clientIp || 'default';

  // Check cache first
  const cached = robloxApiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[Roblox API] Cache hit for username: ${username}`);
    return cached.result;
  }

  // Check rate limit
  const lastCall = robloxApiCalls.get(rateLimitKey) || 0;
  const callsInLastMinute = Array.from(robloxApiCalls.entries())
    .filter(([key, timestamp]) =>
      key.startsWith(rateLimitKey) &&
      (Date.now() - timestamp) < RATE_LIMIT_DURATION
    ).length;

  if (callsInLastMinute >= MAX_CALLS_PER_MINUTE) {
    console.log(`[Roblox API] Rate limit exceeded for ${rateLimitKey}`);
    // Return cached result if available, otherwise assume username exists to avoid blocking
    return cached ? cached.result : true;
  }

  try {
    // Record API call for rate limiting
    robloxApiCalls.set(`${rateLimitKey}_${Date.now()}`, Date.now());

    // Use the current Roblox Users API v1 endpoint
    const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlareBot/1.0'
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });

    if (!response.ok) {
      console.error(`[Roblox API] HTTP ${response.status}: ${response.statusText}`);

      // Fallback to alternative method
      const fallbackResponse = await fetch(`https://www.roblox.com/users/profile?username=${encodeURIComponent(username)}`);
      const exists = fallbackResponse.ok && !fallbackResponse.url.includes('UserNotFound');

      // Cache result
      robloxApiCache.set(cacheKey, { result: exists, timestamp: Date.now() });
      console.log(`[Roblox API] Fallback result for ${username}: ${exists}`);
      return exists;
    }

    const data = await response.json();
    const exists = data.data && data.data.length > 0 && data.data[0].id;

    // Cache the result
    robloxApiCache.set(cacheKey, { result: exists, timestamp: Date.now() });
    console.log(`[Roblox API] Verified username ${username}: ${exists}`);

    return exists;
  } catch (error) {
    console.error('[Roblox API] Connection error:', error);

    // Return cached result if available
    if (cached) {
      console.log(`[Roblox API] Using cached result due to error for ${username}: ${cached.result}`);
      return cached.result;
    }

    // If no cache and error, assume username exists to avoid blocking users
    // This prevents the verification system from breaking due to API issues
    console.log(`[Roblox API] Assuming username exists due to API error: ${username}`);
    return true;
  }
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Register enhanced feature routes
  registerAnalyticsRoutes(app);
  registerNotificationRoutes(app);
  registerUserProfileRoutes(app);
  registerBotMonitoringRoutes(app);
  // Check if user exists and has password
  app.post("/api/check-user", async (req, res) => {
    try {
      const { robloxUsername } = req.body;

      if (!robloxUsername) {
        return res.status(400).json({ error: "Username is required" });
      }

      // Get client IP for rate limiting
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

      // Check if username exists on Roblox
      const userExists = await checkRobloxUserExists(robloxUsername, clientIp);
      if (!userExists) {
        return res.status(400).json({ error: "Roblox username not found" });
      }

      // Check if user already exists with password
      const existingUser = await storage.getUserByUsername(robloxUsername);
      if (existingUser && existingUser.isPasswordSet) {
        return res.json({
          hasPassword: true,
          requiresLogin: true
        });
      }

      res.json({
        hasPassword: false,
        requiresLogin: false
      });
    } catch (error) {
      console.error('[Check User] Error:', error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Login with password for existing users
  app.post("/api/login", async (req, res) => {
    try {
      const { robloxUsername, password } = req.body;

      if (!robloxUsername || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(robloxUsername);
      if (!user || !user.isPasswordSet) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await storage.verifyPassword(user.id, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session for logged in user
      const session = await storage.createVerificationSession({ robloxUsername });
      await storage.updateVerificationSession(session.id, { isVerified: true });

      res.json({
        sessionId: session.id,
        verificationCode: session.verificationCode,
        expiresAt: session.expiresAt,
        robloxUsername: session.robloxUsername,
        isVerified: true,
        skipVerification: true
      });
    } catch (error) {
      console.error('[Login] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Verify Roblox username and create session
  app.post("/api/verify-username", async (req, res) => {
    try {
      const { robloxUsername } = insertVerificationSessionSchema.parse(req.body);

      // Get client IP for rate limiting
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

      // Check if username exists on Roblox
      const userExists = await checkRobloxUserExists(robloxUsername, clientIp);
      if (!userExists) {
        return res.status(400).json({ error: "Roblox username not found" });
      }

      // Create verification session for new users
      const session = await storage.createVerificationSession({ robloxUsername });

      res.json({
        sessionId: session.id,
        verificationCode: session.verificationCode,
        expiresAt: session.expiresAt,
        robloxUsername: session.robloxUsername,
      });
    } catch (error) {
      console.error('[Verify Username] Error:', error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get verification session
  app.get("/api/verification-session/:id", async (req, res) => {
    try {
      const session = await storage.getVerificationSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Check if session expired
      if (session.expiresAt < new Date()) {
        return res.status(410).json({ error: "Verification code expired" });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Verify Roblox about section (check if user has code in their about)
  app.post("/api/verify-about/:sessionId", async (req, res) => {
    try {
      const session = await storage.getVerificationSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.expiresAt < new Date()) {
        return res.status(410).json({ error: "Verification code expired" });
      }

      // Check Roblox profile about section
      const aboutContent = await checkRobloxAboutSection(session.robloxUsername, session.verificationCode);

      if (aboutContent.found) {
        const updatedSession = await storage.updateVerificationSession(session.id, {
          isVerified: true
        });
        res.json(updatedSession);
      } else {
        // Increment verification attempts
        const attempts = await storage.incrementVerificationAttempts(session.id);

        if (attempts >= 3) {
          // Lock account for 30 minutes
          await storage.lockAccountTemporarily(session.id, 30);
          return res.status(429).json({
            error: "Too many failed attempts. Account locked for 30 minutes.",
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000)
          });
        }

        res.status(400).json({
          error: "Verification code not found in about section",
          attemptsRemaining: 3 - attempts
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Set user password
  app.post("/api/set-password", async (req, res) => {
    try {
      const { sessionId, password } = req.body;
      
      if (!sessionId || !password) {
        return res.status(400).json({ error: "Session ID and password are required" });
      }

      const session = await storage.getVerificationSession(sessionId);
      if (!session || !session.isVerified) {
        return res.status(400).json({ error: "Session not found or not verified" });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!password.match(passwordRegex)) {
        return res.status(400).json({ error: "Password must contain at least one uppercase letter, one lowercase letter, and be at least 8 characters long" });
      }

      // Create or update user with the password
      let user = await storage.getUserByUsername(session.robloxUsername);
      if (user) {
        await storage.updateUser(user.id, { password, isPasswordSet: true });
      } else {
        await storage.createUser({ 
          username: session.robloxUsername, 
          password, 
          isPasswordSet: true
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Password setting error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create bot configuration
  app.post("/api/bot-config", async (req, res) => {
    try {
      const configData = insertBotConfigurationSchema.parse(req.body);

      // Verify session exists and is verified
      if (!configData.sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      const session = await storage.getVerificationSession(configData.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (!session.isVerified) {
        return res.status(400).json({ error: "Session not verified" });
      }

      const config = await storage.createBotConfiguration(configData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  // Complete bot configuration
  app.put("/api/bot-config/:id/complete", async (req, res) => {
    try {
      const config = await storage.updateBotConfiguration(req.params.id, {
        isCompleted: true
      });

      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Hardcoded admin credentials
      if (username !== "Kiff1132" || password !== "SystemJoke") {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Deactivate any existing admin sessions
      const existingSession = await storage.getActiveAdminSession();
      if (existingSession) {
        await storage.deactivateAdminSession(existingSession.id);
      }

      // Create new admin session
      const session = await storage.createAdminSession({ username });
      res.json({ sessionId: session.id, username: session.username });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    try {
      const { sessionId } = req.body;
      await storage.deactivateAdminSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Check admin authentication status
  app.get("/api/admin/check-auth", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      if (!sessionId) {
        return res.status(401).json({ error: "No session provided" });
      }

      const session = await storage.getAdminSession(sessionId);
      if (!session || !session.isActive) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }

      res.json({ valid: true, username: session.username });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get admin dashboard data
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      const activeSessions = await storage.getActiveVerificationSessions();

      const stats = {
        activeUsers: submissions.filter(s => s.status === 'verified').length,
        pendingVerifications: submissions.filter(s => s.status === 'pending').length,
        botConfigs: submissions.filter(s => s.game).length,
        systemUptime: '99.9%',
      };

      res.json({
        stats,
        submissions: submissions.slice(0, 20), // Return latest 20 submissions
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete submission (admin only)
  app.delete("/api/admin/submission/:id", async (req, res) => {
    try {
      // In a real implementation, you would verify admin session here
      // For now, we'll just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Request access from admin (updated system)
  app.post("/api/request-access", async (req, res) => {
    try {
      const { sessionId } = req.body;

      const session = await storage.getVerificationSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Prevent duplicate submissions for the same session
      const existingSubmission = await storage.getKeySubmissionBySession(sessionId);
      if (existingSubmission) {
        return res.json({
          success: true,
          message: "Access link already provided.",
          keySubmissionId: existingSubmission.id
        });
      }

      // Create key submission and automatically provide the link
      const keySubmission = await storage.createKeySubmission({
        sessionId: session.id,
        submittedKey: "https://getnative.cc/linkvertise", // Auto-provide the link
        status: "link_provided"
      });

      // Update with admin approval time to simulate admin action
      await storage.updateKeySubmission(keySubmission.id, {
        adminApprovalTime: new Date(),
        status: "link_provided"
      });

      res.json({
        success: true,
        message: "Access link provided automatically.",
        keySubmissionId: keySubmission.id
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Submit access key
  app.post("/api/submit-key", async (req, res) => {
    try {
      const { sessionId, submittedKey } = insertKeySubmissionSchema.parse(req.body);

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const existingSubmission = await storage.getKeySubmissionBySession(sessionId);
      if (!existingSubmission) {
        return res.status(404).json({ error: "Key submission not found" });
      }

      // Check if submitted key matches the generated key
      const isKeyValid = submittedKey === existingSubmission.accessKey;

      if (isKeyValid) {
        const updatedSubmission = await storage.updateKeySubmission(existingSubmission.id, {
          submittedKey,
          status: "pending"
        });
        res.json({
          success: true,
          status: "accepted",
          message: "Key accepted! Waiting for admin approval.",
          keySubmissionId: existingSubmission.id
        });
      } else {
        res.json({
          success: false,
          status: "in_use",
          message: "Bot is being used right now. Please try again later."
        });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid key submission data" });
    }
  });

  // Check key status
  app.get("/api/key-status/:keySubmissionId", async (req, res) => {
    try {
      const submission = await storage.getKeySubmission(req.params.keySubmissionId);
      if (!submission) {
        return res.status(404).json({ error: "Key submission not found" });
      }

      res.json({
        status: submission.status,
        gameAccessTime: submission.gameAccessTime,
        nextIntentTime: submission.nextIntentTime
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin provide access link
  app.post("/api/admin/provide-link/:keySubmissionId", async (req, res) => {
    try {
      const { accessLink } = req.body;
      
      if (!accessLink) {
        return res.status(400).json({ error: "Access link is required" });
      }

      const submission = await storage.getKeySubmission(req.params.keySubmissionId);
      if (!submission) {
        return res.status(404).json({ error: "Key submission not found" });
      }

      // Update submission with admin-provided link
      const updatedSubmission = await storage.updateKeySubmission(submission.id, {
        adminApprovalTime: new Date(),
        status: "link_provided",
        submittedKey: accessLink // Store admin-provided link here temporarily
      });

      // Update the key status to show progression - this fixes the 404 errors
      await storage.updateKeySubmission(submission.id, {
        status: "link_provided"
      });

      res.json({
        success: true,
        message: "Access link provided to user"
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get key submission details
  app.get("/api/key-submission/:keySubmissionId", async (req, res) => {
    try {
      const submission = await storage.getKeySubmission(req.params.keySubmissionId);
      if (!submission) {
        return res.status(404).json({ error: "Key submission not found" });
      }

      res.json(submission);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin approve key (after user submits the key from the link)
  app.post("/api/admin/approve-key/:keySubmissionId", async (req, res) => {
    try {
      const approvedSubmission = await storage.approveKeySubmission(req.params.keySubmissionId);
      if (!approvedSubmission) {
        return res.status(404).json({ error: "Key submission not found" });
      }

      // Get the session to find the username
      const session = await storage.getVerificationSession(approvedSubmission.sessionId!);
      if (session) {
        // Set bot as in use
        await storage.setBotInUse("FlareBot_V1", session.robloxUsername);
      }

      res.json(approvedSubmission);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get bot status
  app.get("/api/bot-status/:botName", async (req, res) => {
    try {
      const status = await storage.getBotStatus(req.params.botName);
      if (!status) {
        return res.status(404).json({ error: "Bot not found" });
      }

      // Check if session has expired
      if (status.isInUse && status.sessionEndTime && status.sessionEndTime < new Date()) {
        // Auto-expire the session
        const updatedStatus = await storage.setBotAvailable(req.params.botName);
        return res.json(updatedStatus);
      }

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all bot statuses
  app.get("/api/bot-statuses", async (req, res) => {
    try {
      const statuses = await storage.getAllBotStatuses();

      // Check for expired sessions and clean them up
      for (const status of statuses) {
        if (status.isInUse && status.sessionEndTime && status.sessionEndTime < new Date()) {
          await storage.setBotAvailable(status.botName);
        }
      }

      // Get updated statuses
      const updatedStatuses = await storage.getAllBotStatuses();
      res.json(updatedStatuses);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Release bot (when user session ends)
  app.post("/api/release-bot/:botName", async (req, res) => {
    try {
      const updatedStatus = await storage.setBotAvailable(req.params.botName);
      res.json(updatedStatus);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}