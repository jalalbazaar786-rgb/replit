import { type User, type InsertUser, type Project, type InsertProject, type Bid, type InsertBid, type Message, type InsertMessage, type Document, type InsertDocument, type Payment, type InsertPayment, users, projects, bids, messages, documents, payments } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, or } from "drizzle-orm";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

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

export const storage = new DatabaseStorage();
