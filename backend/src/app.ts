import "express-async-errors";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import notFound from "./middleware/notFound";
import errorHandler from "./middleware/errorHandler";
import { isDBConnected } from "./config/db";
import { ApiError } from "./utils/ApiError";

const app: Application = express();

const corsOriginsRaw =
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175";
const corsOrigins = corsOriginsRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isWhitelisted = corsOrigins.some(
        (o) => o === "*" || o === origin || origin.endsWith("." + o.replace(/^https?:\/\//, ""))
      );
      if (isWhitelisted) return callback(null, true);
      return callback(null, false);
    },
    credentials: false,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  const db = isDBConnected();
  res.status(db ? 200 : 503).json({
    success: db,
    message: db ? "Server is running" : "Server running but MongoDB is NOT connected",
    db: db ? "connected" : "disconnected",
  });
});

app.use("/api/v1", (_req: Request, _res: Response, next: NextFunction) => {
  if (!isDBConnected()) {
    return next(
      new ApiError(
        503,
        "MongoDB is not connected. Set a valid MONGO_URI in backend/.env and restart the backend server."
      )
    );
  }
  next();
});

app.use("/api/v1", router);

app.use(notFound);
app.use(errorHandler);

export default app;
