import { defineConfig } from "drizzle-kit";

if (!process.env.mongodb+srv://khalilmukhtar08_db_user:WjLjbNWcT697qpbf@cluster0.j3uza6z.mongodb.net/?appName=Cluster0) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
