import { bookingsCollection, type Booking } from "../models/booking.model.js";
import { productsCollection } from "../models/product.model.js";
// import { BOOKING_CONFIG } from "../config/booking.config.js";
import createError from "http-errors";
import { usersCollection } from "../models/user.model.js";

export type Slot = {
  start: Date;
  end: Date;
  available: boolean;
};

const BOOKING_CONFIG = {
  workStart: { hour: 9, minute: 0 },
  workEnd: { hour: 18, minute: 0 },
  slotIntervalMinutes: 30,
} as const;

type CreateBookingInput = {
  userEmail: string;
  productSlug: string;
  startTime: string; // ISO string from client
};

async function isSlotAvailable(startTime: Date, endTime: Date): Promise<boolean> {
  const conflict = await bookingsCollection().findOne({
    startTime: { $lt: endTime },
    endTime:   { $gt: startTime },
    status:    { $ne: "cancelled" },
  });
  if (conflict) return false;
  return true;
}

// export async function createBooking(input: CreateBookingInput): Promise<Booking> {
//   const { userEmail, productSlug, startTime: startTimeRaw } = input;

//   // Validate startTime is a real date
//   const startTime = new Date(startTimeRaw);
//   if (isNaN(startTime.getTime())) throw createError.BadRequest("Invalid startTime");

//   // Verify user exists
//   const user = await usersCollection().findOne({ email: userEmail });
//   if (!user) throw createError.NotFound(`User not found: ${userEmail}`);

//   // Verify product exists
//   const product = await productsCollection().findOne({ slug: productSlug });
//   if (!product) throw createError.NotFound(`Product not found: ${productSlug}`);

//   // Derive endTime — full blocked window including buffer
//   const endTime = new Date(
//     startTime.getTime() + (product.timeInMinutes + product.bufferMinutes) * 60_000
//   );

//   // Re-verify slot is still available — never trust the client
//   await assertSlotIsAvailable(startTime, endTime);

//   // Build and validate the booking
//   const result = BookingSchema.safeParse({
//     reference:    nanoid(8),
//     userEmail:    user.email,
//     productSlug:  product.slug,
//     startTime,
//     endTime,
//     status:       "pending",
//     createdAt:    new Date(),
//   });

//   if (!result.success) throw createError.InternalServerError(result.error.toString());

//   const inserted = await bookingsCollection().insertOne(result.data);
//   return { _id: inserted.insertedId, ...result.data };
// }

function generateSlots(date: Date, totalBlockMinutes: number): Slot[] {
  const slots: Slot[] = [];

  const { workStart, workEnd, slotIntervalMinutes } = BOOKING_CONFIG;

  // Build work window boundaries in UTC for the given date
  const dayStart = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    workStart.hour,
    workStart.minute
  ));

  const dayEnd = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    workEnd.hour,
    workEnd.minute
  ));

  let cursor = new Date(dayStart);

  while (cursor < dayEnd) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + totalBlockMinutes * 120_000);

    // Only offer slot if the full block fits within working hours
    if (slotEnd <= dayEnd) {
      slots.push({ start: slotStart, end: slotEnd, available: true });
    }

    cursor = new Date(cursor.getTime() + slotIntervalMinutes * 120_000);
  }

  return slots;
}

export async function getAvailability(productName: string, date: Date): Promise<Slot[]> {
  // Fetch product
  const product = await productsCollection().findOne({ name: productName });
  if (!product) throw createError.NotFound(`Product "${productName}" not found`);

  const totalBlockMinutes = product.timeInMinutes + product.bufferMinutes;

  // Generate all possible slots for the day
  const slots = generateSlots(date, totalBlockMinutes);
  if (!slots || slots.length === 0) return [];

  const dayStart = slots[0]!.start;
  const dayEnd = slots[slots.length - 1]!.end;

  // Fetch all bookings that overlap with this day
  const existingBookings = await bookingsCollection().find({
    startTime: { $lt: dayEnd },
    endTime:   { $gt: dayStart },
    status:    { $ne: "cancelled" },
  }).toArray();

  // Mark slots unavailable if they overlap any existing booking
  return slots.map((slot) => {
    const overlaps = existingBookings.some(
      (booking) =>
        booking.startTime < slot.end &&
        booking.endTime   > slot.start
    );
    return { ...slot, available: !overlaps };
  });
}