import { z } from "zod";
import { client } from "../db/client.db.js";

export const KeySchema = z.object({
  slug: z.string(), // "toyota-yaris-2024-keyless" — auto-generated on create
  brand: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2100),
  keyType: z.string(),
  price: z.number().min(0),
  priceRetail: z.number().min(0),
  imagesUrls: z.array(z.string()).default([]),
  thumbnailsUrls: z.array(z.string()).default([]),
  //   timeInMinutes: z.number().min(1),
  //   bufferMinutes: z.number().min(0).default(0),
  createdAt: z.date().default(() => new Date()),
});

export type Key = z.infer<typeof KeySchema>;
export const UpdateKeySchema = KeySchema.partial();
export type UpdateKey = z.infer<typeof UpdateKeySchema>;

export const keyCollection = () =>
  client.db("phobo-lock").collection<Key>("keys");
