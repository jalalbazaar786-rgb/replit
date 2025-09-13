import { type User, type InsertUser, type Project, type InsertProject, type Bid, type InsertBid, type Message, type InsertMessage, type Document, type InsertDocument, type Payment, type InsertPayment, users, projects, bids, messages, documents, payments } from "@shared/schema";
import { randomUUID } from "crypto";

// Use in-memory storage for better reliability as per development guidelines

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByOwner(ownerId: string): Promise<Project[]>;
  getOpenProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  
  // Bid operations
  getBid(id: string): Promise<Bid | undefined>;
  getBidsByProject(projectId: string): Promise<Bid[]>;
  getBidsBySupplier(supplierId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: string, bid: Partial<InsertBid>): Promise<Bid | undefined>;
  
  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  getMessagesForProject(projectId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;
  
  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByProject(projectId: string): Promise<Document[]>;
  getDocumentsByOwner(ownerId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByRazorpayOrderId(orderId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string, auditEntry?: any): Promise<Payment | undefined>;
  markWebhookProcessed(id: string): Promise<Payment | undefined>;
  getPaymentsForProject(projectId: string): Promise<Payment[]>;
  getPaymentsForUser(userId: string): Promise<Payment[]>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private projects = new Map<string, Project>();
  private bids = new Map<string, Bid>();
  private messages = new Map<string, Message>();
  private documents = new Map<string, Document>();
  private payments = new Map<string, Payment>();

  constructor() {
    // Add default admin user for testing
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      email: "admin@example.com",
      password: "$2b$10$8K1p/a0dClALc9lPLjm8teeOY8LvZqo1fH6V1RKfWk0ZVk8BvLg5e", // "admin123"
      role: "admin",
      companyName: "Admin Company",
      contactPerson: "Admin User",
      phone: "+1234567890",
      address: "123 Admin St",
      website: "https://admin.example.com",
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: insertUser.id || randomUUID(),
      verified: insertUser.verified ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project operations (minimal implementation)
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.ownerId === ownerId);
  }

  async getOpenProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.status === 'open');
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      ...insertProject,
      id: insertProject.id || randomUUID(),
      status: insertProject.status || 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updateData, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Remaining methods (minimal implementation)
  async getBid(id: string): Promise<Bid | undefined> { return this.bids.get(id); }
  async getBidsByProject(projectId: string): Promise<Bid[]> { return Array.from(this.bids.values()).filter(b => b.projectId === projectId); }
  async getBidsBySupplier(supplierId: string): Promise<Bid[]> { return Array.from(this.bids.values()).filter(b => b.supplierId === supplierId); }
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const bid: Bid = { ...insertBid, id: insertBid.id || randomUUID(), status: insertBid.status || 'pending', createdAt: new Date(), updatedAt: new Date() };
    this.bids.set(bid.id, bid);
    return bid;
  }
  async updateBid(id: string, updateData: Partial<InsertBid>): Promise<Bid | undefined> {
    const bid = this.bids.get(id);
    if (!bid) return undefined;
    const updatedBid = { ...bid, ...updateData, updatedAt: new Date() };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }

  async getMessage(id: string): Promise<Message | undefined> { return this.messages.get(id); }
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> { 
    return Array.from(this.messages.values()).filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1)
    );
  }
  async getMessagesForProject(projectId: string): Promise<Message[]> { return Array.from(this.messages.values()).filter(m => m.projectId === projectId); }
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = { ...insertMessage, id: insertMessage.id || randomUUID(), read: false, createdAt: new Date() };
    this.messages.set(message.id, message);
    return message;
  }
  async markMessageAsRead(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      this.messages.set(id, { ...message, read: true });
    }
  }

  async getDocument(id: string): Promise<Document | undefined> { return this.documents.get(id); }
  async getDocumentsByProject(projectId: string): Promise<Document[]> { return Array.from(this.documents.values()).filter(d => d.projectId === projectId); }
  async getDocumentsByOwner(ownerId: string): Promise<Document[]> { return Array.from(this.documents.values()).filter(d => d.ownerId === ownerId); }
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = { ...insertDocument, id: insertDocument.id || randomUUID(), createdAt: new Date() };
    this.documents.set(document.id, document);
    return document;
  }
  async deleteDocument(id: string): Promise<void> { this.documents.delete(id); }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = { ...insertPayment, id: insertPayment.id || randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    this.payments.set(payment.id, payment);
    return payment;
  }
  async getPayment(id: string): Promise<Payment | undefined> { return this.payments.get(id); }
  async getPaymentByRazorpayOrderId(orderId: string): Promise<Payment | undefined> {
    for (const payment of this.payments.values()) {
      if (payment.razorpayOrderId === orderId) return payment;
    }
    return undefined;
  }
  async updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string, auditEntry?: any): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    const updatedPayment = { ...payment, status, razorpayPaymentId: razorpayPaymentId || payment.razorpayPaymentId, updatedAt: new Date() };
    if (auditEntry) {
      const currentAudit = Array.isArray(payment.auditTrail) ? payment.auditTrail : [];
      updatedPayment.auditTrail = [...currentAudit, { ...auditEntry, timestamp: new Date().toISOString() }];
    }
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  async markWebhookProcessed(id: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    const updatedPayment = { ...payment, webhookProcessed: true, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  async getPaymentsForProject(projectId: string): Promise<Payment[]> { return Array.from(this.payments.values()).filter(p => p.projectId === projectId); }
  async getPaymentsForUser(userId: string): Promise<Payment[]> { return Array.from(this.payments.values()).filter(p => p.payerId === userId || p.payeeId === userId); }
}

// DatabaseStorage class removed to eliminate database connection timeouts

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.ownerId, ownerId)).orderBy(desc(projects.createdAt));
  }

  async getOpenProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.status, 'open')).orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async getBid(id: string): Promise<Bid | undefined> {
    const result = await db.select().from(bids).where(eq(bids.id, id)).limit(1);
    return result[0];
  }

  async getBidsByProject(projectId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.projectId, projectId)).orderBy(desc(bids.createdAt));
  }

  async getBidsBySupplier(supplierId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.supplierId, supplierId)).orderBy(desc(bids.createdAt));
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const result = await db.insert(bids).values(insertBid).returning();
    return result[0];
  }

  async updateBid(id: string, updateData: Partial<InsertBid>): Promise<Bid | undefined> {
    const result = await db.update(bids)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return result[0];
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.receiverId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.receiverId, userId1)
          )
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getMessagesForProject(projectId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.projectId, projectId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ read: true }).where(eq(messages.id, id));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByOwner(ownerId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.ownerId, ownerId)).orderBy(desc(documents.createdAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(insertPayment).returning();
    return result[0];
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getPaymentByRazorpayOrderId(orderId: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.razorpayOrderId, orderId)).limit(1);
    return result[0];
  }

  async updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string, auditEntry?: any): Promise<Payment | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (razorpayPaymentId) {
      updateData.razorpayPaymentId = razorpayPaymentId;
    }
    if (auditEntry) {
      // Get current payment to append audit entry
      const currentPayment = await this.getPayment(id);
      if (currentPayment) {
        const currentAudit = Array.isArray(currentPayment.auditTrail) ? currentPayment.auditTrail : [];
        updateData.auditTrail = [...currentAudit, { ...auditEntry, timestamp: new Date().toISOString() }];
      }
    }
    
    const result = await db.update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async markWebhookProcessed(id: string): Promise<Payment | undefined> {
    const result = await db.update(payments)
      .set({ webhookProcessed: true, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async getPaymentsForProject(projectId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.projectId, projectId)).orderBy(desc(payments.createdAt));
  }

  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(or(eq(payments.payerId, userId), eq(payments.payeeId, userId)))
      .orderBy(desc(payments.createdAt));
  }
}

export const storage = new MemStorage();
