import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { productsCollection, ProductSchema, UpdateProductSchema, type Product } from "../models/product.model.js";
import { parseObjectId, asyncHandler } from "../services/util.services.js";

export const getProducts = asyncHandler(async (_req, res) => {
  const products = await productsCollection().find().toArray();
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const id = parseObjectId(req.params.id);
  if (!id) throw createError.BadRequest("Invalid ID");

  const product = await productsCollection().findOne({ _id: id });
  if (!product) throw createError.NotFound("Product not found");

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const result = ProductSchema.safeParse(req.body);
  if (!result.success) throw createError.BadRequest(result.error.flatten().toString());

  const inserted = await productsCollection().insertOne(result.data);
  res.status(201).json({ _id: inserted.insertedId, ...result.data });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = parseObjectId(req.params.id);
  if (!id) throw createError.BadRequest("Invalid ID");

  const result = UpdateProductSchema.safeParse(req.body);
  if (!result.success) throw createError.BadRequest(result.error.flatten().toString());

  const $set = Object.fromEntries(
    Object.entries(result.data).filter(([_, v]) => v !== undefined)
  ) as Partial<Product>;

  const updated = await productsCollection().findOneAndUpdate(
    { _id: id },
    { $set },
    { returnDocument: "after" }
  );
  if (!updated) throw createError.NotFound("Product not found");

  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseObjectId(req.params.id);
  if (!id) throw createError.BadRequest("Invalid ID");

  const deleted = await productsCollection().findOneAndDelete({ _id: id });
  if (!deleted) throw createError.NotFound("Product not found");

  res.json({ message: "Product deleted" });
});