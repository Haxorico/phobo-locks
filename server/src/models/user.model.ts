import { z } from "zod";
import { client } from "../db/client.db.js";

// Zod schema — runtime validation
export const UserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  createdAt: z.date().default(() => new Date()),
});

// TypeScript type — inferred from the schema, no duplication
export type User = z.infer<typeof UserSchema>;

// Typed MongoDB collection
export const usersCollection = () =>
  client.db("phobo-lock").collection<User>("users");

// Partial schema for updates — all fields optional
export const UpdateUserSchema = UserSchema.partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;