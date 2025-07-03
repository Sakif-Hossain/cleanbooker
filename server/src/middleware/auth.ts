import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { AuthenticatedRequest } from "../types";
import { sendResponse } from "../utils/response";

const prisma = new PrismaClient();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      sendResponse(res, false, null, "Access token required", [], 401);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      select: { id: true, businessName: true, email: true, isActive: true },
    });

    if (!business || !business.isActive) {
      sendResponse(res, false, null, "Invalid or inactive account", [], 401);
      return;
    }

    req.business = {
      id: business.id,
      businessName: business.businessName,
      email: business.email,
      role: decoded.role || "admin",
    };

    next();
  } catch (error) {
    sendResponse(res, false, null, "Invalid token", [], 401);
  }
};
