import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const meshes = pgTable("meshes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // obj, stl, ply
  fileSize: integer("file_size").notNull(),
  vertices: integer("vertices").notNull().default(0),
  faces: integer("faces").notNull().default(0),
  data: text("data").notNull(), // Base64 encoded mesh data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  isBot: boolean("is_bot").notNull().default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const macros = pgTable("macros", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  commands: json("commands").notNull(), // Array of command objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMeshSchema = createInsertSchema(meshes).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertMacroSchema = createInsertSchema(macros).omit({
  id: true,
  createdAt: true,
});

export type InsertMesh = z.infer<typeof insertMeshSchema>;
export type Mesh = typeof meshes.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertMacro = z.infer<typeof insertMacroSchema>;
export type Macro = typeof macros.$inferSelect;
