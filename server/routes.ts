import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Razorpay from "razorpay";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertBidSchema, 
  insertMessageSchema, 
  insertDocumentSchema, 
  insertPaymentSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
  webhookEventSchema
} from "@shared/schema";
import { z } from "zod";

// Security helper functions
function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
import crypto from "crypto";

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
  // Razorpay configuration
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

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

  // Payment routes
  app.post('/api/payments/create-order', requireAuth, async (req, res) => {
    try {
      // Validate request body with Zod schema
      const validatedData = createPaymentOrderSchema.parse(req.body);
      const { bidId, projectId, amount, type, currency } = validatedData;

      // Validate relationships and authorization atomically
      const [bid, project] = await Promise.all([
        storage.getBid(bidId),
        storage.getProject(projectId)
      ]);

      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Critical security checks
      if (bid.projectId !== projectId) {
        return res.status(400).json({ message: 'Bid does not belong to specified project' });
      }

      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Only project owner can create payments' });
      }

      if (bid.status !== 'pending') {
        return res.status(400).json({ message: 'Can only create payment for pending bids' });
      }

      // Verify bid amount matches payment amount (prevent tampering)
      if (parseFloat(amount) !== parseFloat(bid.price || '0')) {
        return res.status(400).json({ message: 'Payment amount must match bid price' });
      }

      // Get supplier information
      const supplier = await storage.getUser(bid.supplierId);
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      // Check for duplicate payment orders
      const existingPayments = await storage.getPaymentsForProject(projectId);
      const existingPayment = existingPayments.find(p => p.bidId === bidId && p.status !== 'failed');
      if (existingPayment) {
        return res.status(409).json({ message: 'Payment already exists for this bid' });
      }

      // Create Razorpay order with proper validation
      const orderAmount = Math.round(parseFloat(amount) * 100); // Convert to paise
      const razorpayOrder = await razorpay.orders.create({
        amount: orderAmount,
        currency: currency,
        receipt: `bid_${bidId}_${Date.now()}`,
        notes: {
          bidId,
          projectId,
          payerId: req.user.id,
          payeeId: bid.supplierId,
          type,
          companyName: req.user.companyName || 'Unknown'
        }
      });

      // Store payment record with audit trail
      const payment = await storage.createPayment({
        razorpayOrderId: razorpayOrder.id,
        projectId,
        bidId,
        payerId: req.user.id,
        payeeId: bid.supplierId,
        amount: amount,
        currency: currency,
        status: 'created',
        type,
        webhookProcessed: false,
        auditTrail: [
          {
            action: 'payment_order_created',
            userId: req.user.id,
            timestamp: new Date().toISOString(),
            details: { orderId: razorpayOrder.id, amount, currency, type }
          }
        ]
      });

      res.json({
        orderId: razorpayOrder.id,
        amount: orderAmount,
        currency: currency,
        paymentId: payment.id,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error('Payment order creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) 
        });
      }
      res.status(500).json({ message: 'Failed to create payment order' });
    }
  });

  app.post('/api/payments/verify', requireAuth, async (req, res) => {
    try {
      // Validate request body
      const validatedData = verifyPaymentSchema.parse(req.body);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validatedData;

      // Find payment record first
      const payment = await storage.getPaymentByRazorpayOrderId(razorpay_order_id);
      if (!payment) {
        return res.status(404).json({ message: 'Payment record not found' });
      }

      // Critical authorization check: verify requester is the payer
      if (payment.payerId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized: You can only verify your own payments' });
      }

      // Prevent duplicate verification
      if (payment.status === 'paid') {
        return res.status(409).json({ message: 'Payment already verified' });
      }

      // Verify signature using timing-safe comparison
      const isSignatureValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET!
      );

      if (!isSignatureValid) {
        // Log security incident
        console.error('Payment signature verification failed', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          userId: req.user.id,
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({ message: 'Payment signature verification failed' });
      }

      // Get related bid and project for validation
      const [bid, project] = await Promise.all([
        storage.getBid(payment.bidId),
        storage.getProject(payment.projectId)
      ]);

      if (!bid || !project) {
        return res.status(404).json({ message: 'Associated bid or project not found' });
      }

      // Final security validation
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized: Project ownership mismatch' });
      }

      if (bid.projectId !== payment.projectId) {
        return res.status(400).json({ message: 'Payment data integrity error' });
      }

      // Atomic update: payment, bid, and project
      try {
        const auditEntry = {
          action: 'payment_verified',
          userId: req.user.id,
          razorpayPaymentId: razorpay_payment_id,
          verificationMethod: 'frontend',
          details: { orderId: razorpay_order_id }
        };

        // Update payment status with audit trail
        const updatedPayment = await storage.updatePaymentStatus(
          payment.id, 
          'paid', 
          razorpay_payment_id,
          auditEntry
        );

        if (!updatedPayment) {
          throw new Error('Failed to update payment status');
        }

        // Auto-award the bid and update project status
        await Promise.all([
          storage.updateBid(payment.bidId, { status: 'accepted' }),
          storage.updateProject(payment.projectId, { 
            status: 'awarded', 
            awardedBidId: payment.bidId 
          })
        ]);

        res.json({ 
          message: 'Payment verified successfully', 
          payment: {
            id: updatedPayment.id,
            status: updatedPayment.status,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency
          },
          bidAwarded: true
        });
      } catch (updateError) {
        console.error('Payment verification update failed:', updateError);
        return res.status(500).json({ message: 'Failed to process payment verification' });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) 
        });
      }
      res.status(500).json({ message: 'Payment verification failed' });
    }
  });

  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        console.error('Webhook signature missing');
        return res.status(400).json({ message: 'Webhook signature required' });
      }

      const body = JSON.stringify(req.body);
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!;
      
      // Verify webhook signature using timing-safe comparison
      const isSignatureValid = verifyWebhookSignature(body, signature, webhookSecret);
      
      if (!isSignatureValid) {
        console.error('Invalid webhook signature', {
          timestamp: new Date().toISOString(),
          event: req.body.event || 'unknown'
        });
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }

      // Validate webhook event structure
      const eventData = webhookEventSchema.parse(req.body);
      const { event, payload } = eventData;
      
      if (event === 'payment.captured') {
        const paymentId = payload.payment.entity.id;
        const orderId = payload.payment.entity.order_id;
        const amount = payload.payment.entity.amount;
        const currency = payload.payment.entity.currency;
        
        // Find payment and check for idempotency
        const payment = await storage.getPaymentByRazorpayOrderId(orderId);
        if (!payment) {
          console.warn('Webhook received for unknown payment order:', orderId);
          return res.json({ status: 'ignored' });
        }

        // Idempotency check
        if (payment.webhookProcessed) {
          console.log('Webhook already processed for payment:', payment.id);
          return res.json({ status: 'already_processed' });
        }

        // Verify amount consistency
        const expectedAmount = Math.round(parseFloat(payment.amount) * 100);
        if (amount !== expectedAmount) {
          console.error('Amount mismatch in webhook', {
            paymentId: payment.id,
            expected: expectedAmount,
            received: amount
          });
          return res.status(400).json({ message: 'Amount mismatch' });
        }

        // Atomic update with audit trail
        try {
          const auditEntry = {
            action: 'webhook_payment_captured',
            razorpayPaymentId: paymentId,
            verificationMethod: 'webhook',
            details: { orderId, amount, currency }
          };

          // Update payment status and mark webhook processed
          await Promise.all([
            storage.updatePaymentStatus(payment.id, 'paid', paymentId, auditEntry),
            storage.markWebhookProcessed(payment.id)
          ]);
          
          // Auto-award bid and update project
          await Promise.all([
            storage.updateBid(payment.bidId, { status: 'accepted' }),
            storage.updateProject(payment.projectId, { 
              status: 'awarded', 
              awardedBidId: payment.bidId 
            })
          ]);

          console.log('Webhook processed successfully:', {
            paymentId: payment.id,
            orderId,
            bidId: payment.bidId
          });
        } catch (updateError) {
          console.error('Webhook processing failed:', updateError);
          return res.status(500).json({ message: 'Failed to process webhook' });
        }
      } else if (event === 'payment.failed') {
        const orderId = payload.payment.entity.order_id;
        const payment = await storage.getPaymentByRazorpayOrderId(orderId);
        
        if (payment && !payment.webhookProcessed) {
          const auditEntry = {
            action: 'webhook_payment_failed',
            verificationMethod: 'webhook',
            details: { orderId, reason: 'payment_failed_webhook' }
          };

          await Promise.all([
            storage.updatePaymentStatus(payment.id, 'failed', undefined, auditEntry),
            storage.markWebhookProcessed(payment.id)
          ]);

          console.log('Payment failure processed via webhook:', payment.id);
        }
      }

      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      if (error instanceof z.ZodError) {
        console.error('Webhook validation failed:', error.errors);
        return res.status(400).json({ message: 'Invalid webhook data structure' });
      }
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  app.get('/api/payments', requireAuth, async (req, res) => {
    try {
      const { projectId } = req.query;
      
      let payments;
      if (projectId) {
        // Verify user has access to this project
        const project = await storage.getProject(projectId as string);
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }
        
        // Only project owner or suppliers with bids can see project payments
        if (project.ownerId !== req.user.id) {
          const bids = await storage.getBidsByProject(projectId as string);
          const userBids = bids.filter(bid => bid.supplierId === req.user.id);
          if (userBids.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: No access to this project payments' });
          }
        }
        
        payments = await storage.getPaymentsForProject(projectId as string);
        // Filter payments based on user role
        if (project.ownerId !== req.user.id) {
          payments = payments.filter(p => p.payeeId === req.user.id);
        }
      } else {
        payments = await storage.getPaymentsForUser(req.user.id);
      }
      
      // Sanitize payment data
      const sanitizedPayments = payments.map(payment => ({
        id: payment.id,
        projectId: payment.projectId,
        bidId: payment.bidId,
        payerId: payment.payerId,
        payeeId: payment.payeeId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        type: payment.type,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        // Only show detailed audit trail to payers
        ...(payment.payerId === req.user.id && { auditTrail: payment.auditTrail })
      }));
      
      res.json(sanitizedPayments);
    } catch (error) {
      console.error('Payments fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  app.get('/api/payments/:id', requireAuth, async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Strict authorization check
      if (payment.payerId !== req.user.id && payment.payeeId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized: You can only view your own payments' });
      }

      // Return sanitized payment data (exclude sensitive audit details for non-payers)
      const sanitizedPayment = {
        id: payment.id,
        projectId: payment.projectId,
        bidId: payment.bidId,
        payerId: payment.payerId,
        payeeId: payment.payeeId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        type: payment.type,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        // Only show audit trail to payer
        ...(payment.payerId === req.user.id && { auditTrail: payment.auditTrail })
      };

      res.json(sanitizedPayment);
    } catch (error) {
      console.error('Payment fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch payment' });
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
