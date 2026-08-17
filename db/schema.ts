import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  region: text("region").notNull(),
  businessName: text("business_name").notNull().default(""),
  specialty: text("specialty").notNull().default(""),
  experience: text("experience").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  transaction: text("transaction").notNull(),
  price: real("price").notNull(),
  priceSuffix: text("price_suffix").notNull().default("total"),
  location: text("location").notNull(),
  seller: text("seller").notNull(),
  phone: text("phone").notNull().default(""),
  role: text("role").notNull(),
  condition: text("condition").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  accent: text("accent").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
