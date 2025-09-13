import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'company', 'supplier', 'ngo', 'admin'
  companyName: text("company_name"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'materials', 'labor', 'machinery', 'subcontractor'
  budget: decimal("budget", { precision: 12, scale: 2 }),
  location: text("location").notNull(),
  startDate: timestamp("start_date"),
  deadline: timestamp("deadline"),
  status: text("status").default("open"), // 'open', 'bidding', 'awarded', 'completed', 'cancelled'
  requirements: jsonb("requirements"), // JSON object for additional requirements
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  awardedBidId: varchar("awarded_bid_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  deliveryTime: integer("delivery_time").notNull(), // days
  proposal: text("proposal").notNull(),
  attachments: jsonb("attachments"), // Array of file URLs
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected', 'withdrawn'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  content: text("content").notNull(),
  attachments: jsonb("attachments"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'contract', 'certificate', 'invoice', 'other'
  url: text("url").notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  bidId: varchar("bid_id").notNull().references(() => bids.id),
  payerId: varchar("payer_id").notNull().references(() => users.id),
  payeeId: varchar("payee_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  status: text("status").default("created"), // 'created', 'paid', 'failed', 'refunded'
  type: text("type").notNull(), // 'escrow', 'direct', 'partial'
  webhookProcessed: boolean("webhook_processed").default(false),
  auditTrail: jsonb("audit_trail").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  awardedBidId: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  webhookProcessed: true,
  auditTrail: true,
});

// Payment validation schemas
export const createPaymentOrderSchema = z.object({
  bidId: z.string().uuid('Invalid bid ID format'),
  projectId: z.string().uuid('Invalid project ID format'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid decimal with max 2 decimal places'),
  type: z.enum(['escrow', 'direct', 'partial']).default('escrow'),
  currency: z.enum(['INR']).default('INR'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

export const webhookEventSchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        status: z.string(),
        amount: z.number(),
        currency: z.string(),
      }),
    }),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
