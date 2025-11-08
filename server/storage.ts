import { db } from "./db";
import {
  users,
  investments,
  properties,
  products,
  posts,
  settings,
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
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
}

export const storage = new DatabaseStorage();
