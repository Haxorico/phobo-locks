import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../services/util.services.js";
import { keyCollection } from "../models/key.model.js";

export const getKeys = asyncHandler(async (_req, res) => {
  const keys = await keyCollection().find().toArray();
  res.json({ keys });
});

export const getKeysBrands = asyncHandler(async (_req, res) => {
  const brands = await keyCollection().distinct("brand");
  res.json({ brands });
});

export const getKeysByBrand = asyncHandler(async (req, res) => {
  const name = req.params.name as string;
  const keys = await keyCollection()
    .find({ brand: name }, { projection: { priceRetail: 0, createdAt: 0 } })
    .toArray();
  res.json({ keys });
});
