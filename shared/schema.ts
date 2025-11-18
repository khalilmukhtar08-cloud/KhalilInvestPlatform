import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const investmentStatusEnum = pgEnum("investment_status", ["pending", "approved", "rejected"]);
export const propertyStatusEnum = pgEnum("property_status", ["pending", "approved", "rejected"]);
export const propertyTypeEnum = pgEnum("property_type", ["residential", "commercial", "land"]);
export const productStatusEnum = pgEnum("product_status", ["active", "pending", "flagged"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "scheduled", "published"]);
export const platformEnum = pgEnum("platform", ["facebook", "instagram", "linkedin", "tiktok", "twitter"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdraw", "transfer_sent", "transfer_received"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);
export const p2pOrderTypeEnum = pgEnum("p2p_order_type", ["buy", "sell"]);
export const p2pOrderStatusEnum = pgEnum("p2p_order_status", ["open", "in_progress", "completed", "cancelled"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  referralCode: text("referral_code").unique(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedAt: true,
  referralCode: true,
  isEmailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Investments table
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull().default("0"),
  status: investmentStatusEnum("status").notNull().default("pending"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  commission: true,
}).extend({
  amount: z.coerce.number().positive("Amount must be positive"),
  roi: z.coerce.number().optional(),
});

export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  location: text("location").notNull(),
  image: text("image"),
  status: propertyStatusEnum("status").notNull().default("pending"),
  type: propertyTypeEnum("type").notNull(),
  promoted: boolean("promoted").notNull().default(false),
  listingFee: decimal("listing_fee", { precision: 10, scale: 2 }).notNull().default("10.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  listingFee: true,
}).extend({
  price: z.coerce.number().positive("Price must be positive"),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image"),
  status: productStatusEnum("status").notNull().default("pending"),
  stock: integer("stock").notNull().default(0),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  commission: true,
}).extend({
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  caption: text("caption").notNull(),
  platforms: text("platforms").array().notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  platforms: z.array(z.enum(["facebook", "instagram", "linkedin", "tiktok", "twitter"])).min(1, "Select at least one platform"),
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Settings table
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investmentCommission: decimal("investment_commission", { precision: 5, scale: 2 }).notNull().default("10.00"),
  ecommerceCommission: decimal("ecommerce_commission", { precision: 5, scale: 2 }).notNull().default("5.00"),
  listingFee: decimal("listing_fee", { precision: 10, scale: 2 }).notNull().default("10.00"),
  referralReward: decimal("referral_reward", { precision: 10, scale: 2 }).notNull().default("10.00"),
  affiliateCommission: decimal("affiliate_commission", { precision: 5, scale: 2 }).notNull().default("15.00"),
  alpacaApiKey: text("alpaca_api_key"),
  finnhubApiKey: text("finnhub_api_key"),
  polygonApiKey: text("polygon_api_key"),
  openaiApiKey: text("openai_api_key"),
  googleMapsApiKey: text("google_maps_api_key"),
  emailHost: text("email_host"),
  emailPort: integer("email_port"),
  emailUser: text("email_user"),
  emailPassword: text("email_password"),
  emailFrom: text("email_from"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
}).extend({
  investmentCommission: z.coerce.number().min(0).max(100).optional(),
  ecommerceCommission: z.coerce.number().min(0).max(100).optional(),
  listingFee: z.coerce.number().min(0).optional(),
  referralReward: z.coerce.number().min(0).optional(),
  affiliateCommission: z.coerce.number().min(0).max(100).optional(),
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Referrals table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredId: varchar("referred_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull().default("0"),
  isPaid: boolean("is_paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueReferral: sql`UNIQUE (${table.referrerId}, ${table.referredId})`,
}));

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  reward: true,
  isPaid: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Affiliates table
export const ambassadorTierEnum = pgEnum("ambassador_tier", ["bronze", "silver", "gold", "platinum"]);

export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  affiliateCode: text("affiliate_code").notNull().unique(),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).notNull().default("0"),
  tier: ambassadorTierEnum("tier").notNull().default("bronze"),
  salesCount: integer("sales_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  createdAt: true,
  totalSales: true,
  totalCommission: true,
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// Affiliate Sales table
export const affiliateSales = pgTable("affiliate_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAffiliateSaleSchema = createInsertSchema(affiliateSales).omit({
  id: true,
  createdAt: true,
});

export type InsertAffiliateSale = z.infer<typeof insertAffiliateSaleSchema>;
export type AffiliateSale = typeof affiliateSales.$inferSelect;

// Social Connections table
export const socialConnections = pgTable("social_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  accountId: text("account_id").notNull(),
  accountName: text("account_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type SocialConnection = typeof socialConnections.$inferSelect;

// Email Notifications table
export const emailNotifications = pgTable("email_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  recipients: text("recipients").array().notNull(),
  sentBy: varchar("sent_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: text("status").notNull().default("sent"),
});

export const insertEmailNotificationSchema = createInsertSchema(emailNotifications).omit({
  id: true,
  sentAt: true,
  status: true,
});

export type InsertEmailNotification = z.infer<typeof insertEmailNotificationSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;

// User Preferences table
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("completed"),
  paymentMethod: text("payment_method"),
  description: text("description"),
  recipientId: varchar("recipient_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.string().optional(),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// P2P Orders table
export const p2pOrders = pgTable("p2p_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: p2pOrderTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  minLimit: decimal("min_limit", { precision: 12, scale: 2 }).notNull(),
  maxLimit: decimal("max_limit", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: p2pOrderStatusEnum("status").notNull().default("open"),
  matchedUserId: varchar("matched_user_id").references(() => users.id, { onDelete: "set null" }),
  completedAmount: decimal("completed_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertP2POrderSchema = createInsertSchema(p2pOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAmount: true,
}).extend({
  amount: z.coerce.number().positive("Amount must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  minLimit: z.coerce.number().positive("Minimum limit must be positive"),
  maxLimit: z.coerce.number().positive("Maximum limit must be positive"),
});

export type InsertP2POrder = z.infer<typeof insertP2POrderSchema>;
export type P2POrder = typeof p2pOrders.$inferSelect;
