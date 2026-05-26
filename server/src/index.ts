import express from "express";
const app = express();
const PORT = 3001;
app.get("/", (_req, res) => res.send("loco server running"));
app.listen(PORT, () => console.log(`Server on port ${PORT}`));