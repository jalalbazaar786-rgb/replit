import { type User, type InsertUser, type Project, type InsertProject, type Bid, type InsertBid, type Message, type InsertMessage, type Document, type InsertDocument } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private bids: Map<string, Bid>;
  private messages: Map<string, Message>;
  private documents: Map<string, Document>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.bids = new Map();
    this.messages = new Map();
    this.documents = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      verified: false,
      createdAt: now,
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.ownerId === ownerId);
  }

  async getOpenProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.status === 'open');
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      status: "open",
      awardedBidId: null,
      createdAt: now,
      updatedAt: now 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updateData, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async getBid(id: string): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async getBidsByProject(projectId: string): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(bid => bid.projectId === projectId);
  }

  async getBidsBySupplier(supplierId: string): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(bid => bid.supplierId === supplierId);
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = randomUUID();
    const now = new Date();
    const bid: Bid = { 
      ...insertBid, 
      id, 
      status: "pending",
      createdAt: now,
      updatedAt: now 
    };
    this.bids.set(id, bid);
    return bid;
  }

  async updateBid(id: string, updateData: Partial<InsertBid>): Promise<Bid | undefined> {
    const bid = this.bids.get(id);
    if (!bid) return undefined;
    
    const updatedBid = { ...bid, ...updateData, updatedAt: new Date() };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => 
      (message.senderId === userId1 && message.receiverId === userId2) ||
      (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getMessagesForProject(projectId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.projectId === projectId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      read: false,
      createdAt: now 
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      this.messages.set(id, { ...message, read: true });
    }
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.projectId === projectId);
  }

  async getDocumentsByOwner(ownerId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.ownerId === ownerId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt: now 
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }
}

export const storage = new MemStorage();
