import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVerificationSessionSchema, insertBotConfigurationSchema, insertAdminSessionSchema, insertKeySubmissionSchema } from "@shared/schema";
import { z } from "zod";

// Roblox API helper function
async function checkRobloxUserExists(username: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.roblox.com/users/get-by-username?username=${encodeURIComponent(username)}`);
    const data = await response.json();
    return !data.errorMessage && data.Id;
  } catch (error) {
    console.error('Roblox API error:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Verify Roblox username and create session
  app.post("/api/verify-username", async (req, res) => {
    try {
      const { robloxUsername } = insertVerificationSessionSchema.parse(req.body);
      
      // Check if username exists on Roblox
      const userExists = await checkRobloxUserExists(robloxUsername);
      if (!userExists) {
        return res.status(400).json({ error: "Roblox username not found" });
      }

      // Create verification session
      const session = await storage.createVerificationSession({ robloxUsername });
      
      res.json({
        sessionId: session.id,
        verificationCode: session.verificationCode,
        expiresAt: session.expiresAt,
        robloxUsername: session.robloxUsername,
      });
    } catch (error) {
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

  // Verify Roblox status (check if user has code in their status)
  app.post("/api/verify-status/:sessionId", async (req, res) => {
    try {
      const session = await storage.getVerificationSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.expiresAt < new Date()) {
        return res.status(410).json({ error: "Verification code expired" });
      }

      // In a real implementation, you would check the user's Roblox status here
      // For now, we'll simulate verification after a delay
      const updatedSession = await storage.updateVerificationSession(session.id, {
        isVerified: true
      });

      res.json(updatedSession);
    } catch (error) {
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

  // Generate access link and key
  app.post("/api/generate-link/:sessionId", async (req, res) => {
    try {
      const session = await storage.getVerificationSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Create key submission
      const keySubmission = await storage.createKeySubmission({ 
        sessionId: session.id, 
        submittedKey: null 
      });
      
      // Generate a unique access link (in production, this would be a real external service)
      const linkId = Math.random().toString(36).substr(2, 16);
      const accessLink = `https://flarebot-keys.com/access/${linkId}`;
      
      res.json({ 
        accessLink, 
        accessKey: keySubmission.accessKey,
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

  // Admin approve key
  app.post("/api/admin/approve-key/:keySubmissionId", async (req, res) => {
    try {
      const approvedSubmission = await storage.approveKeySubmission(req.params.keySubmissionId);
      if (!approvedSubmission) {
        return res.status(404).json({ error: "Key submission not found" });
      }
      
      res.json(approvedSubmission);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
