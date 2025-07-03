import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.routes";
import customerRoutes from "./routes/customer.routes";
import bookingRoutes from "./routes/booking.routes";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", customerRoutes);

// 404 handler
app.all("/*all", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    meta: {
      timestamp: new Date().toISOString(),
      requestId: "unknown",
    },
  });
});

// Error handler
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      meta: {
        timestamp: new Date().toISOString(),
        requestId: "unknown",
      },
    });
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
});

export default app;

app.use("/api/bookings", bookingRoutes);
