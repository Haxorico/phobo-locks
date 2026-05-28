import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../services/util.services.js";
import { getAvailability } from "../services/schedule.service.js";
import createError from "http-errors";
import {
  BookingSchema,
  bookingsCollection,
  type Booking,
} from "../models/booking.model.js";
import { productsCollection } from "../models/product.model.js";

export const getAvailabilityForProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { productName, date } = req.query;

    if (typeof productName !== "string")
      throw createError.BadRequest("productName is required");
    if (typeof date !== "string")
      throw createError.BadRequest("date is required");

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime()))
      throw createError.BadRequest(
        "date must be a valid ISO date e.g. 2026-06-01",
      );

    const slots = await getAvailability(productName, parsedDate);
    res.json(slots);
  },
);

export const addBooking = asyncHandler(async (req: Request, res: Response) => {
  const { selectedProduct, selectedSlot } = req.body;
  //TODO: getting user details and verify them
  //verify data:
  // --Product
  const product = await productsCollection().findOne({
    name: selectedProduct.name,
  });
  if (!product)
    throw createError.NotFound(`Product not found: ${selectedProduct.name}`);
  //TODO: check if slot is available
  const startTime = new Date(selectedSlot.start);
  const endTime = new Date(startTime.getTime() + (product.timeInMinutes * 60_000));
  const slot: Partial<Booking> = {
    startTime,
    endTime,
    productName: product.name,
    userEmail: "bob@example.com",
  };

  const result = BookingSchema.safeParse(slot);
  if (!result.success) throw createError.BadRequest(result.error.toString());

  const inserted = await bookingsCollection().insertOne(result.data);
  //TODO: add the booking to the user
  res.status(201).json({ _id: inserted.insertedId, ...result.data });
});
