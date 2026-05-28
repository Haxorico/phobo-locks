import { z } from "zod";
import { client } from "../db/client.db.js";

// Zod schema — runtime validation
export const ProductSchema = z.object({
  //TODO: add unum
  name: z.string().min(1),
  price: z.number().min(1),
  timeInMinutes: z.number().min(1),
  bufferMinutes: z.number().min(0).default(0),
  createdAt: z.date().default(() => new Date()),
});

// TypeScript type — inferred from the schema, no duplication
export type Product = z.infer<typeof ProductSchema>;

// Typed MongoDB collection
export const productsCollection = () =>
  client.db("phobo-lock").collection<Product>("products");

// Partial schema for updates — all fields optional
export const UpdateProductSchema = ProductSchema.partial();
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;