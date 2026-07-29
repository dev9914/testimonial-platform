import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import { configureCloudinary } from "./config/cloudinary";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  configureCloudinary();

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });

  try {
    await connectDB();
  } catch (error) {
    console.error(
      `⚠️  MongoDB not connected: ${(error as Error).message}. HTTP server is still running on port ${PORT} — API calls will return 503 until a valid MONGO_URI is set in backend/.env.`
    );
  }
};

startServer();
