import { Router } from "express";

import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js";
import scheduleRoutes from "./schedule.routes.js"
import keyRoutes from "./key.routes.js"

const router = Router();
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/schedule",scheduleRoutes);
router.use("/keys", keyRoutes)

export default router;