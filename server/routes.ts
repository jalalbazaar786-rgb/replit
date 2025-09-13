import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertBidSchema, insertMessageSchema, insertDocumentSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      role: string;
      companyName?: string;
    }
  }
}

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyName: user.companyName || undefined
      });
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) {
      return done(null, false);
    }
    done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      companyName: user.companyName || undefined
    });
  } catch (error) {
    done(error);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'buildbidz-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      res.status(201).json({ 
        message: 'User created successfully', 
        user: { id: user.id, username: user.username, email: user.email, role: user.role } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  // Project routes
  app.get('/api/projects', requireAuth, async (req, res) => {
    try {
      let projects;
      if (req.user.role === 'company' || req.user.role === 'ngo') {
        projects = await storage.getProjectsByOwner(req.user.id);
      } else {
        projects = await storage.getOpenProjects();
      }
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
    try {
      if (req.user.role !== 'company' && req.user.role !== 'ngo') {
        return res.status(403).json({ message: 'Only companies and NGOs can create projects' });
      }

      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...projectData,
        ownerId: req.user.id
      });

      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  // Bid routes
  app.get('/api/projects/:projectId/bids', requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Only project owner or bid owners can view bids
      const bids = await storage.getBidsByProject(req.params.projectId);
      
      if (project.ownerId === req.user.id) {
        // Project owner can see all bids
        res.json(bids);
      } else {
        // Suppliers can only see their own bids
        const userBids = bids.filter(bid => bid.supplierId === req.user.id);
        res.json(userBids);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bids' });
    }
  });

  app.post('/api/projects/:projectId/bids', requireAuth, async (req, res) => {
    try {
      if (req.user.role !== 'supplier') {
        return res.status(403).json({ message: 'Only suppliers can submit bids' });
      }

      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.status !== 'open') {
        return res.status(400).json({ message: 'Project is not open for bidding' });
      }

      const bidData = insertBidSchema.parse(req.body);
      const bid = await storage.createBid({
        ...bidData,
        projectId: req.params.projectId,
        supplierId: req.user.id
      });

      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to submit bid' });
    }
  });

  app.post('/api/bids/:bidId/award', requireAuth, async (req, res) => {
    try {
      const bid = await storage.getBid(req.params.bidId);
      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }

      const project = await storage.getProject(bid.projectId);
      if (!project || project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await storage.updateBid(req.params.bidId, { status: 'accepted' });
      await storage.updateProject(bid.projectId, { 
        status: 'awarded', 
        awardedBidId: req.params.bidId 
      });

      res.json({ message: 'Bid awarded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to award bid' });
    }
  });

  // Message routes
  app.get('/api/messages', requireAuth, async (req, res) => {
    try {
      const { userId, projectId } = req.query;
      
      let messages;
      if (userId) {
        messages = await storage.getMessagesBetweenUsers(req.user.id, userId as string);
      } else if (projectId) {
        messages = await storage.getMessagesForProject(projectId as string);
      } else {
        // Get all messages for the user
        const allMessages = Array.from((storage as any).messages.values());
        messages = allMessages.filter(msg => 
          msg.senderId === req.user.id || msg.receiverId === req.user.id
        );
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...messageData,
        senderId: req.user.id
      });

      // Broadcast message via WebSocket
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            message
          }));
        }
      });

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Document routes
  app.get('/api/documents', requireAuth, async (req, res) => {
    try {
      const { projectId } = req.query;
      
      let documents;
      if (projectId) {
        documents = await storage.getDocumentsByProject(projectId as string);
      } else {
        documents = await storage.getDocumentsByOwner(req.user.id);
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', requireAuth, async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument({
        ...documentData,
        ownerId: req.user.id
      });

      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create document' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjectsByOwner(req.user.id);
      const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'awarded').length;
      
      let pendingBids = 0;
      let totalSpend = 0;
      
      if (req.user.role === 'company' || req.user.role === 'ngo') {
        // For companies/NGOs, count bids on their projects
        for (const project of projects) {
          const bids = await storage.getBidsByProject(project.id);
          pendingBids += bids.filter(b => b.status === 'pending').length;
          
          const awardedBid = bids.find(b => b.status === 'accepted');
          if (awardedBid) {
            totalSpend += parseFloat(awardedBid.price || '0');
          }
        }
      } else if (req.user.role === 'supplier') {
        // For suppliers, count their own bids
        const bids = await storage.getBidsBySupplier(req.user.id);
        pendingBids = bids.filter(b => b.status === 'pending').length;
      }

      const stats = {
        activeProjects,
        pendingBids,
        totalSpend: `$${(totalSpend / 1000000).toFixed(1)}M`,
        suppliers: 89 // Mock value for now
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
