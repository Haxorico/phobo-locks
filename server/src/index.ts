import express from "express";
import { connectDB } from "./db/client.db.js";
import apiRoutes from "./routes/api.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());
app.use("/api", apiRoutes);
app.use(errorHandler);
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
