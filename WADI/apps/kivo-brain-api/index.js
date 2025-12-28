import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/message.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/kivo", messageRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "online", service: "kivo-brain-api" });
});

app.listen(PORT, () => {
  console.log(`Kivo Brain API running on port ${PORT}`);
});
