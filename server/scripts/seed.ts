import { connectDB, client } from "../src/db/client.db.js";
import {
  usersCollection,
  UserSchema,
  type User,
} from "../src/models/user.model.js";
import {
  productsCollection,
  ProductSchema,
  type Product,
} from "../src/models/product.model.js";

async function seedUsers() {
  console.log("Creating Users...");

  await usersCollection().deleteMany({});

  console.log("🧹 Cleared existing users");
  const seeds: Omit<User, "createdAt">[] = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@example.com" },
    { name: "Carol White", email: "carol@example.com" },
  ];
  const users = seeds.map((u) => {
    const result = UserSchema.safeParse({ ...u, createdAt: new Date() });
    if (!result.success)
      throw new Error(`Invalid seed data for ${u.email}: ${result.error}`);
    return result.data;
  });
  const { insertedCount } = await usersCollection().insertMany(users);
  console.log(`🌱 Seeded ${insertedCount} users`);
}

async function seedProducts() {
  console.log("Creating Products...");

  await productsCollection().deleteMany({});

  console.log("🧹 Cleared existing products");
  const seeds: Omit<Product, "createdAt">[] = [
    { name: "Toyota lock", price: 100, timeInMinutes: 60, bufferMinutes: 0 },
    { name: "Ford lock", price: 200, timeInMinutes: 90, bufferMinutes: 0 },
  ];
  const products = seeds.map((u) => {
    const result = ProductSchema.safeParse({ ...u, createdAt: new Date() });
    if (!result.success)
      throw new Error(`Invalid seed data for ${u.name}: ${result.error}`);
    return result.data;
  });
  const { insertedCount } = await productsCollection().insertMany(products);
  console.log(`🌱 Seeded ${insertedCount} products`);
}
async function seed() {
  await connectDB();
  await Promise.all([seedUsers(), seedProducts()]);

  await client.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  client.close();
  process.exit(1);
});
