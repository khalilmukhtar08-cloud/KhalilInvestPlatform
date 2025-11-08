import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertInvestmentSchema,
  insertPropertySchema,
  insertProductSchema,
  insertPostSchema,
  type User 
} from "@shared/schema";

declare global {
  namespace Express {
    interface User extends import("@shared/schema").User {}
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const newUser = await storage.createUser({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "user",
        isBlocked: false,
      });

      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ user: userWithoutPassword });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json({ user: userWithoutPassword });
  });

  app.get("/api/users", isAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id/block", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { blocked } = req.body;
      await storage.blockUser(id, blocked);
      res.json({ message: "User updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete user" });
    }
  });

  app.get("/api/investments", isAuthenticated, async (req, res) => {
    try {
      const investments = req.user!.role === "admin"
        ? await storage.getAllInvestments()
        : await storage.getInvestmentsByUser(req.user!.id);
      res.json({ investments });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch investments" });
    }
  });

  app.get("/api/investments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const investment = await storage.getInvestment(id);
      
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      if (req.user!.role !== "admin" && investment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json({ investment });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch investment" });
    }
  });

  app.post("/api/investments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse(req.body);
      
      const commission = validatedData.amount * 0.10;
      
      const investment = await storage.createInvestment({
        userId: req.user!.id,
        projectName: validatedData.projectName,
        amount: validatedData.amount,
        roi: validatedData.roi || 0,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        status: "pending",
        commission,
      });
      res.status(201).json({ investment });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create investment" });
    }
  });

  app.patch("/api/investments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getInvestment(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const allowedFields: Partial<typeof req.body> = {};
      if (req.body.projectName) allowedFields.projectName = req.body.projectName;
      if (req.body.amount) {
        allowedFields.amount = req.body.amount;
        allowedFields.commission = req.body.amount * 0.10;
      }
      if (req.body.roi !== undefined) allowedFields.roi = req.body.roi;
      if (req.body.startDate) allowedFields.startDate = req.body.startDate;
      if (req.body.endDate) allowedFields.endDate = req.body.endDate;
      
      const updated = await storage.updateInvestment(id, allowedFields);
      res.json({ investment: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update investment" });
    }
  });

  app.patch("/api/investments/:id/status", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateInvestmentStatus(id, status);
      res.json({ message: "Investment status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update investment status" });
    }
  });

  app.delete("/api/investments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getInvestment(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteInvestment(id);
      res.json({ message: "Investment deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete investment" });
    }
  });

  app.get("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const properties = req.user!.role === "admin"
        ? await storage.getAllProperties()
        : await storage.getPropertiesByUser(req.user!.id);
      res.json({ properties });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (req.user!.role !== "admin" && property.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json({ property });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch property" });
    }
  });

  app.post("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      
      const property = await storage.createProperty({
        userId: req.user!.id,
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        location: validatedData.location,
        image: validatedData.image,
        type: validatedData.type,
        promoted: validatedData.promoted || false,
        status: "pending",
      });
      res.status(201).json({ property });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create property" });
    }
  });

  app.patch("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getProperty(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const allowedFields: Partial<typeof req.body> = {};
      if (req.body.title) allowedFields.title = req.body.title;
      if (req.body.description !== undefined) allowedFields.description = req.body.description;
      if (req.body.price) allowedFields.price = req.body.price;
      if (req.body.location) allowedFields.location = req.body.location;
      if (req.body.image !== undefined) allowedFields.image = req.body.image;
      if (req.body.type) allowedFields.type = req.body.type;
      if (req.body.promoted !== undefined) allowedFields.promoted = req.body.promoted;
      
      const updated = await storage.updateProperty(id, allowedFields);
      res.json({ property: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update property" });
    }
  });

  app.patch("/api/properties/:id/status", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updatePropertyStatus(id, status);
      res.json({ message: "Property status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update property status" });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getProperty(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProperty(id);
      res.json({ message: "Property deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete property" });
    }
  });

  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const products = req.user!.role === "admin"
        ? await storage.getAllProducts()
        : await storage.getProductsByUser(req.user!.id);
      res.json({ products });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (req.user!.role !== "admin" && product.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json({ product });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      const commission = validatedData.price * 0.05;
      
      const product = await storage.createProduct({
        userId: req.user!.id,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category: validatedData.category,
        image: validatedData.image,
        stock: validatedData.stock,
        status: "pending",
        commission,
      });
      res.status(201).json({ product });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getProduct(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const allowedFields: Partial<typeof req.body> = {};
      if (req.body.name) allowedFields.name = req.body.name;
      if (req.body.description !== undefined) allowedFields.description = req.body.description;
      if (req.body.price) {
        allowedFields.price = req.body.price;
        allowedFields.commission = req.body.price * 0.05;
      }
      if (req.body.category) allowedFields.category = req.body.category;
      if (req.body.image !== undefined) allowedFields.image = req.body.image;
      if (req.body.stock !== undefined) allowedFields.stock = req.body.stock;
      
      const updated = await storage.updateProduct(id, allowedFields);
      res.json({ product: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update product" });
    }
  });

  app.patch("/api/products/:id/status", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateProductStatus(id, status);
      res.json({ message: "Product status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update product status" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getProduct(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete product" });
    }
  });

  app.get("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const posts = req.user!.role === "admin"
        ? await storage.getAllPosts()
        : await storage.getPostsByUser(req.user!.id);
      res.json({ posts });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (req.user!.role !== "admin" && post.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json({ post });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      
      const post = await storage.createPost({
        userId: req.user!.id,
        caption: validatedData.caption,
        platforms: validatedData.platforms,
        status: validatedData.status || "draft",
        scheduledFor: validatedData.scheduledFor,
      });
      res.status(201).json({ post });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create post" });
    }
  });

  app.patch("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getPost(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const allowedFields: Partial<typeof req.body> = {};
      if (req.body.caption) allowedFields.caption = req.body.caption;
      if (req.body.platforms) allowedFields.platforms = req.body.platforms;
      if (req.body.status) allowedFields.status = req.body.status;
      if (req.body.scheduledFor !== undefined) allowedFields.scheduledFor = req.body.scheduledFor;
      
      const updated = await storage.updatePost(id, allowedFields);
      res.json({ post: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getPost(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (req.user!.role !== "admin" && existing.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deletePost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete post" });
    }
  });

  app.get("/api/settings", isAdmin, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json({ settings });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json({ settings: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
