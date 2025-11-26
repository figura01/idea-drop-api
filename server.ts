import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import ideaRoutes from "./routes/ideaRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/ideas", ideaRoutes);
app.use("/api/auth", authRoutes);

// 404 Fallback
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
