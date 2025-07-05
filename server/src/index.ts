import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.routes";
import customerRoutes from "./routes/customer.routes";
import bookingRoutes from "./routes/booking.routes";
import serviceRoutes from "./routes/service.routes";
import analyticsRoutes from "./routes/analytics.routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const serverUrl = process.env.SERVER_URL || "http://localhost:3000";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CleanBooker API",
      version: "1.0.0",
      description: "API docs for CleanBooker application",
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [`${__dirname}/routes/*.ts`, `${__dirname}/swagger/*.ts`],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

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
  console.log(`📚 Swagger docs at http://localhost:3000/api-docs`);
});

export default app;

app.use("/api/bookings", bookingRoutes);
