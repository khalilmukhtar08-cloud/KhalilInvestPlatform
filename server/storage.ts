import { db } from "./db";
import {
  users,
  investments,
  properties,
  products,
  posts,
  settings,
  referrals,
  affiliates,
  affiliateSales,
  socialConnections,
  emailNotifications,
  userPreferences,
  transactions,
  p2pOrders,
  type User,
  type InsertUser,
  type Investment,
  type InsertInvestment,
  type Property,
  type InsertProperty,
  type Product,
  type InsertProduct,
  type Post,
  type InsertPost,
  type Settings,
  type InsertSettings,
  type Referral,
  type InsertReferral,
  type Affiliate,
  type InsertAffiliate,
  type AffiliateSale,
  type InsertAffiliateSale,
  type SocialConnection,
  type InsertSocialConnection,
  type EmailNotification,
  type InsertEmailNotification,
  type UserPreferences,
  type InsertUserPreferences,
  type Transaction,
  type InsertTransaction,
  type P2POrder,
  type InsertP2POrder,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { InsufficientFundsError, UserNotFoundError } from "./errors";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  blockUser(id: string, blocked: boolean): Promise<void>;

  // Investments
  getInvestment(id: string): Promise<Investment | undefined>;
  getInvestmentsByUser(userId: string): Promise<Investment[]>;
  getAllInvestments(): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, data: Partial<Investment>): Promise<Investment | undefined>;
  updateInvestmentStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void>;
  deleteInvestment(id: string): Promise<void>;

  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesByUser(userId: string): Promise<Property[]>;
  getAllProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, data: Partial<Property>): Promise<Property | undefined>;
  updatePropertyStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void>;
  promoteProperty(id: string): Promise<void>;
  deleteProperty(id: string): Promise<void>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByUser(userId: string): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  updateProductStatus(id: string, status: "active" | "pending" | "flagged"): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getPostsByUser(userId: string): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(data: Partial<Settings>): Promise<Settings>;

  // Referrals
  getReferral(id: string): Promise<Referral | undefined>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined>;
  markReferralPaid(id: string): Promise<void>;
  deleteReferral(id: string): Promise<void>;

  // Affiliates
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  getAffiliateByUserId(userId: string): Promise<Affiliate | undefined>;
  getAffiliateByCode(code: string): Promise<Affiliate | undefined>;
  getAllAffiliates(): Promise<Affiliate[]>;
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  updateAffiliate(id: string, data: Partial<Affiliate>): Promise<Affiliate | undefined>;
  deleteAffiliate(id: string): Promise<void>;

  // Affiliate Sales
  getAffiliateSale(id: string): Promise<AffiliateSale | undefined>;
  getSalesByAffiliate(affiliateId: string): Promise<AffiliateSale[]>;
  createAffiliateSale(sale: InsertAffiliateSale): Promise<AffiliateSale>;
  markSalePaid(id: string): Promise<void>;

  // Social Connections
  getSocialConnection(id: string): Promise<SocialConnection | undefined>;
  getSocialConnectionsByUser(userId: string): Promise<SocialConnection[]>;
  getAllActiveSocialConnections(): Promise<SocialConnection[]>;
  createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection>;
  updateSocialConnection(id: string, data: Partial<SocialConnection>): Promise<SocialConnection | undefined>;
  deleteSocialConnection(id: string): Promise<void>;

  // Email Notifications
  getEmailNotification(id: string): Promise<EmailNotification | undefined>;
  getAllEmailNotifications(): Promise<EmailNotification[]>;
  createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences | undefined>;

  // Transactions (Wallet)
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserBalance(userId: string): Promise<string>;
  deposit(userId: string, amount: number, description?: string): Promise<Transaction>;
  withdraw(userId: string, amount: number, description?: string): Promise<Transaction>;
  transfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<{ senderTransaction: Transaction; recipientTransaction: Transaction }>;

  // P2P Orders
  getP2POrder(id: string): Promise<P2POrder | undefined>;
  getP2POrdersByUser(userId: string): Promise<P2POrder[]>;
  getAllP2POrders(): Promise<P2POrder[]>;
  getOpenP2POrders(type: "buy" | "sell"): Promise<P2POrder[]>;
  createP2POrder(order: InsertP2POrder): Promise<P2POrder>;
  updateP2POrder(id: string, data: Partial<P2POrder>): Promise<P2POrder | undefined>;
  matchP2POrder(orderId: string, userId: string, amount: number): Promise<{ order: P2POrder; transaction: Transaction }>;
  completeP2POrder(orderId: string): Promise<void>;
  cancelP2POrder(orderId: string): Promise<void>;
  deleteP2POrder(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.joinedAt));
  }

  async blockUser(id: string, blocked: boolean): Promise<void> {
    await db.update(users).set({ isBlocked: blocked }).where(eq(users.id, id));
  }

  // Investments
  async getInvestment(id: string): Promise<Investment | undefined> {
    const [investment] = await db.select().from(investments).where(eq(investments.id, id)).limit(1);
    return investment;
  }

  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    return db.select().from(investments).where(eq(investments.userId, userId)).orderBy(desc(investments.createdAt));
  }

  async getAllInvestments(): Promise<Investment[]> {
    return db.select().from(investments).orderBy(desc(investments.createdAt));
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db.insert(investments).values({
      ...investment,
      amount: investment.amount.toString(),
      roi: investment.roi ? investment.roi.toString() : "0",
    }).returning();
    return newInvestment;
  }

  async updateInvestment(id: string, data: Partial<Investment>): Promise<Investment | undefined> {
    const [updated] = await db.update(investments).set({ ...data, updatedAt: new Date() }).where(eq(investments.id, id)).returning();
    return updated;
  }

  async updateInvestmentStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void> {
    await db.update(investments).set({ status, updatedAt: new Date() }).where(eq(investments.id, id));
  }

  async deleteInvestment(id: string): Promise<void> {
    await db.delete(investments).where(eq(investments.id, id));
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return property;
  }

  async getPropertiesByUser(userId: string): Promise<Property[]> {
    return db.select().from(properties).where(eq(properties.userId, userId)).orderBy(desc(properties.createdAt));
  }

  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values({
      ...property,
      price: property.price.toString(),
    }).returning();
    return newProperty;
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property | undefined> {
    const [updated] = await db.update(properties).set({ ...data, updatedAt: new Date() }).where(eq(properties.id, id)).returning();
    return updated;
  }

  async updatePropertyStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<void> {
    await db.update(properties).set({ status, updatedAt: new Date() }).where(eq(properties.id, id));
  }

  async promoteProperty(id: string): Promise<void> {
    await db.update(properties).set({ promoted: true, updatedAt: new Date() }).where(eq(properties.id, id));
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product;
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values({
      ...product,
      price: product.price.toString(),
    }).returning();
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return updated;
  }

  async updateProductStatus(id: string, status: "active" | "pending" | "flagged"): Promise<void> {
    await db.update(products).set({ status, updatedAt: new Date() }).where(eq(products.id, id));
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Posts
  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return post;
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    const [updated] = await db.update(posts).set({ ...data, updatedAt: new Date() }).where(eq(posts.id, id)).returning();
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    if (!setting) {
      // Create default settings if none exist
      const [newSettings] = await db.insert(settings).values({}).returning();
      return newSettings;
    }
    return setting;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const existing = await this.getSettings();
    if (!existing) {
      const [newSettings] = await db.insert(settings).values(data).returning();
      return newSettings;
    }
    const [updated] = await db.update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  // Referrals
  async getReferral(id: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id)).limit(1);
    return referral;
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.code, code)).limit(1);
    return referral;
  }

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId)).orderBy(desc(referrals.createdAt));
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined> {
    const [updated] = await db.update(referrals).set(data).where(eq(referrals.id, id)).returning();
    return updated;
  }

  async markReferralPaid(id: string): Promise<void> {
    await db.update(referrals).set({ isPaid: true }).where(eq(referrals.id, id));
  }

  async deleteReferral(id: string): Promise<void> {
    await db.delete(referrals).where(eq(referrals.id, id));
  }

  // Affiliates
  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id)).limit(1);
    return affiliate;
  }

  async getAffiliateByUserId(userId: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
    return affiliate;
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code)).limit(1);
    return affiliate;
  }

  async getAllAffiliates(): Promise<Affiliate[]> {
    return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }

  async createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate> {
    const [newAffiliate] = await db.insert(affiliates).values(affiliate).returning();
    return newAffiliate;
  }

  async updateAffiliate(id: string, data: Partial<Affiliate>): Promise<Affiliate | undefined> {
    const [updated] = await db.update(affiliates).set(data).where(eq(affiliates.id, id)).returning();
    return updated;
  }

  async deleteAffiliate(id: string): Promise<void> {
    await db.delete(affiliates).where(eq(affiliates.id, id));
  }

  // Affiliate Sales
  async getAffiliateSale(id: string): Promise<AffiliateSale | undefined> {
    const [sale] = await db.select().from(affiliateSales).where(eq(affiliateSales.id, id)).limit(1);
    return sale;
  }

  async getSalesByAffiliate(affiliateId: string): Promise<AffiliateSale[]> {
    return db.select().from(affiliateSales).where(eq(affiliateSales.affiliateId, affiliateId)).orderBy(desc(affiliateSales.createdAt));
  }

  async createAffiliateSale(sale: InsertAffiliateSale): Promise<AffiliateSale> {
    const [newSale] = await db.insert(affiliateSales).values({
      ...sale,
      amount: sale.amount.toString(),
      commission: sale.commission.toString(),
    }).returning();
    
    const affiliate = await this.getAffiliate(sale.affiliateId);
    if (affiliate) {
      const newTotal = parseFloat(affiliate.totalSales) + parseFloat(sale.amount.toString());
      const newCommission = parseFloat(affiliate.totalCommission) + parseFloat(sale.commission.toString());
      await this.updateAffiliate(sale.affiliateId, {
        totalSales: newTotal.toString(),
        totalCommission: newCommission.toString(),
      });
    }
    
    return newSale;
  }

  async markSalePaid(id: string): Promise<void> {
    await db.update(affiliateSales).set({ isPaid: true }).where(eq(affiliateSales.id, id));
  }

  // Social Connections
  async getSocialConnection(id: string): Promise<SocialConnection | undefined> {
    const [connection] = await db.select().from(socialConnections).where(eq(socialConnections.id, id)).limit(1);
    return connection;
  }

  async getSocialConnectionsByUser(userId: string): Promise<SocialConnection[]> {
    return db.select().from(socialConnections).where(eq(socialConnections.userId, userId)).orderBy(desc(socialConnections.createdAt));
  }

  async getAllActiveSocialConnections(): Promise<SocialConnection[]> {
    return db.select().from(socialConnections).where(eq(socialConnections.isActive, true)).orderBy(desc(socialConnections.createdAt));
  }

  async createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection> {
    const [newConnection] = await db.insert(socialConnections).values(connection).returning();
    return newConnection;
  }

  async updateSocialConnection(id: string, data: Partial<SocialConnection>): Promise<SocialConnection | undefined> {
    const [updated] = await db.update(socialConnections).set({ ...data, updatedAt: new Date() }).where(eq(socialConnections.id, id)).returning();
    return updated;
  }

  async deleteSocialConnection(id: string): Promise<void> {
    await db.delete(socialConnections).where(eq(socialConnections.id, id));
  }

  // Email Notifications
  async getEmailNotification(id: string): Promise<EmailNotification | undefined> {
    const [notification] = await db.select().from(emailNotifications).where(eq(emailNotifications.id, id)).limit(1);
    return notification;
  }

  async getAllEmailNotifications(): Promise<EmailNotification[]> {
    return db.select().from(emailNotifications).orderBy(desc(emailNotifications.sentAt));
  }

  async createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification> {
    const [newNotification] = await db.insert(emailNotifications).values(notification).returning();
    return newNotification;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
    return preferences;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [newPreferences] = await db.insert(userPreferences).values(preferences).returning();
    return newPreferences;
  }

  async updateUserPreferences(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    const [updated] = await db.update(userPreferences).set({ ...data, updatedAt: new Date() }).where(eq(userPreferences.userId, userId)).returning();
    return updated;
  }

  // Transactions (Wallet)
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return transaction;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values({
      ...transaction,
      amount: transaction.amount.toString(),
    }).returning();
    return newTransaction;
  }

  async getUserBalance(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    return user?.balance || "0.00";
  }

  async deposit(userId: string, amount: number, description?: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user) {
        throw new UserNotFoundError();
      }

      await tx.update(users)
        .set({ balance: sql`${users.balance} + ${amount.toString()}` })
        .where(eq(users.id, userId));

      const [transaction] = await tx.insert(transactions).values({
        userId,
        type: "deposit",
        amount: amount.toString(),
        status: "completed",
        description: description || "Deposit to wallet",
      }).returning();

      return transaction;
    });
  }

  async withdraw(userId: string, amount: number, description?: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const result = await tx.update(users)
        .set({ balance: sql`${users.balance} - ${amount.toString()}` })
        .where(and(
          eq(users.id, userId),
          sql`${users.balance}::numeric >= ${amount.toString()}::numeric`
        ))
        .returning({ id: users.id, balance: users.balance });

      if (!result || result.length === 0 || !result[0]) {
        const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user) {
          throw new UserNotFoundError();
        }
        throw new InsufficientFundsError();
      }

      const [transaction] = await tx.insert(transactions).values({
        userId,
        type: "withdraw",
        amount: amount.toString(),
        status: "completed",
        description: description || "Withdrawal from wallet",
      }).returning();

      return transaction;
    });
  }

  async transfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<{ senderTransaction: Transaction; recipientTransaction: Transaction }> {
    return await db.transaction(async (tx) => {
      const [sender] = await tx.select().from(users).where(eq(users.id, fromUserId)).limit(1);
      const [recipient] = await tx.select().from(users).where(eq(users.id, toUserId)).limit(1);
      
      if (!sender) {
        throw new UserNotFoundError();
      }
      
      if (!recipient) {
        throw new Error("Recipient user not found");
      }

      if (sender.id === recipient.id) {
        throw new Error("Cannot transfer to yourself");
      }

      const senderResult = await tx.update(users)
        .set({ balance: sql`${users.balance} - ${amount.toString()}` })
        .where(and(
          eq(users.id, fromUserId),
          sql`${users.balance}::numeric >= ${amount.toString()}::numeric`
        ))
        .returning({ id: users.id, balance: users.balance });

      if (!senderResult || senderResult.length === 0) {
        throw new InsufficientFundsError();
      }

      await tx.update(users)
        .set({ balance: sql`${users.balance} + ${amount.toString()}` })
        .where(eq(users.id, toUserId));

      const [senderTransaction] = await tx.insert(transactions).values({
        userId: fromUserId,
        recipientId: toUserId,
        type: "transfer_sent",
        amount: amount.toString(),
        status: "completed",
        description: description || `Transfer to ${recipient.name}`,
      }).returning();

      const [recipientTransaction] = await tx.insert(transactions).values({
        userId: toUserId,
        recipientId: fromUserId,
        type: "transfer_received",
        amount: amount.toString(),
        status: "completed",
        description: description || `Transfer from ${sender.name}`,
      }).returning();

      return { senderTransaction, recipientTransaction };
    });
  }

  // P2P Orders
  async getP2POrder(id: string): Promise<P2POrder | undefined> {
    const [order] = await db.select().from(p2pOrders).where(eq(p2pOrders.id, id)).limit(1);
    return order;
  }

  async getP2POrdersByUser(userId: string): Promise<P2POrder[]> {
    return db.select().from(p2pOrders).where(eq(p2pOrders.userId, userId)).orderBy(desc(p2pOrders.createdAt));
  }

  async getAllP2POrders(): Promise<P2POrder[]> {
    return db.select().from(p2pOrders).orderBy(desc(p2pOrders.createdAt));
  }

  async getOpenP2POrders(type: "buy" | "sell"): Promise<P2POrder[]> {
    return db.select().from(p2pOrders)
      .where(and(
        eq(p2pOrders.type, type),
        eq(p2pOrders.status, "open")
      ))
      .orderBy(desc(p2pOrders.createdAt));
  }

  async createP2POrder(order: InsertP2POrder): Promise<P2POrder> {
    const [newOrder] = await db.insert(p2pOrders).values({
      ...order,
      amount: order.amount.toString(),
      price: order.price.toString(),
      minLimit: order.minLimit.toString(),
      maxLimit: order.maxLimit.toString(),
    }).returning();
    return newOrder;
  }

  async updateP2POrder(id: string, data: Partial<P2POrder>): Promise<P2POrder | undefined> {
    const [updated] = await db.update(p2pOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(p2pOrders.id, id))
      .returning();
    return updated;
  }

  async matchP2POrder(orderId: string, userId: string, amount: number): Promise<{ order: P2POrder; transaction: Transaction }> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.select().from(p2pOrders).where(eq(p2pOrders.id, orderId)).limit(1);
      
      if (!order) {
        throw new Error("P2P order not found");
      }

      if (order.status !== "open") {
        throw new Error("Order is not available");
      }

      if (order.userId === userId) {
        throw new Error("Cannot match your own order");
      }

      const [updatedOrder] = await tx.update(p2pOrders)
        .set({
          status: "in_progress",
          matchedUserId: userId,
          updatedAt: new Date(),
        })
        .where(eq(p2pOrders.id, orderId))
        .returning();

      const [transaction] = await tx.insert(transactions).values({
        userId,
        type: "transfer_sent",
        amount: amount.toString(),
        status: "pending",
        description: `P2P order match - ${order.type} order`,
        recipientId: order.userId,
      }).returning();

      return { order: updatedOrder, transaction };
    });
  }

  async completeP2POrder(orderId: string): Promise<void> {
    await db.update(p2pOrders)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(p2pOrders.id, orderId));
  }

  async cancelP2POrder(orderId: string): Promise<void> {
    await db.update(p2pOrders)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(p2pOrders.id, orderId));
  }

  async deleteP2POrder(id: string): Promise<void> {
    await db.delete(p2pOrders).where(eq(p2pOrders.id, id));
  }
}

export const storage = new DatabaseStorage();
