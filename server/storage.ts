import { type User, type InsertUser, type Project, type InsertProject, type Bid, type InsertBid, type Message, type InsertMessage, type Document, type InsertDocument, type Payment, type InsertPayment } from "@shared/schema";
import { randomUUID } from "crypto";

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
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      companyName: insertUser.companyName ?? null,
      contactPerson: insertUser.contactPerson ?? null,
      phone: insertUser.phone ?? null,
      address: insertUser.address ?? null,
      website: insertUser.website ?? null,
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
      id: randomUUID(),
      status: insertProject.status ?? 'open',
      budget: insertProject.budget ?? null,
      startDate: insertProject.startDate ?? null,
      deadline: insertProject.deadline ?? null,
      requirements: insertProject.requirements ?? null,
      awardedBidId: null,
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
    const bid: Bid = {
      ...insertBid,
      id: randomUUID(),
      status: insertBid.status ?? 'pending',
      attachments: insertBid.attachments ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
    const message: Message = {
      ...insertMessage,
      id: randomUUID(),
      projectId: insertMessage.projectId ?? null,
      attachments: insertMessage.attachments ?? null,
      read: insertMessage.read ?? false,
      createdAt: new Date()
    };
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
    const document: Document = {
      ...insertDocument,
      id: randomUUID(),
      projectId: insertDocument.projectId ?? null,
      createdAt: new Date()
    };
    this.documents.set(document.id, document);
    return document;
  }
  async deleteDocument(id: string): Promise<void> { this.documents.delete(id); }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      id: randomUUID(),
      status: insertPayment.status ?? 'created',
      razorpayPaymentId: insertPayment.razorpayPaymentId ?? null,
      currency: insertPayment.currency ?? 'INR',
      webhookProcessed: false,
      auditTrail: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.set(payment.id, payment);
    return payment;
  }
  async getPayment(id: string): Promise<Payment | undefined> { return this.payments.get(id); }
  async getPaymentByRazorpayOrderId(orderId: string): Promise<Payment | undefined> {
    for (const payment of Array.from(this.payments.values())) {
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

export const storage = new MemStorage();