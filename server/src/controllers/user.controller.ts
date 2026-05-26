import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { usersCollection, UserSchema, UpdateUserSchema, type User } from "../models/user.model.js";
import { parseObjectId, asyncHandler } from "../services/util.services.js";

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await usersCollection().find().toArray();
  res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const id = parseObjectId(req.params.id);
  if (!id) throw createError.BadRequest("Invalid ID");

  const user = await usersCollection().findOne({ _id: id });
  if (!user) throw createError.NotFound("User not found");

  res.json(user);
});

export const createUser = asyncHandler(async (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) throw createError.BadRequest(result.error.flatten().toString());

  const inserted = await usersCollection().insertOne(result.data);
  res.status(201).json({ _id: inserted.insertedId, ...result.data });
});

export const updateUser = asyncHandler(async (req, res) => {
  const id = parseObjectId(req.params.id);
  if (!id) throw createError.BadRequest("Invalid ID");

  const result = UpdateUserSchema.safeParse(req.body);
  if (!result.success) throw createError.BadRequest(result.error.flatten().toString());

  const $set = Object.fromEntries(
    Object.entries(result.data).filter(([_, v]) => v !== undefined)
  ) as Partial<User>;

  const updated = await usersCollection().findOneAndUpdate(
    { _id: id },
    { $set },
    { returnDocument: "after" }
  );
  if (!updated) throw createError.NotFound("User not found");

  res.json(updated);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = parseObjectId(req.params.id);
  if (!id) throw createError.BadRequest("Invalid ID");

  const deleted = await usersCollection().findOneAndDelete({ _id: id });
  if (!deleted) throw createError.NotFound("User not found");

  res.json({ message: "User deleted" });
});