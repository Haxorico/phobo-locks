import { z } from "zod";
import { client } from "../db/client.db.js";

export const BookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
    //TODO: add unum
  userEmail: z.email(),
  productName: z.string(),
  startTime: z.date(), // UTC — what the customer picked
  endTime: z.date(), // startTime + timeInMinutes + bufferMinutes
  status: BookingStatusSchema.default("pending"),
  createdAt: z.date().default(() => new Date()),
});

export type Booking = z.infer<typeof BookingSchema>;

export const UpdateBookingSchema = BookingSchema.partial();
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;

export const bookingsCollection = () =>
  client.db("phobo-lock").collection<Booking>("bookings");
