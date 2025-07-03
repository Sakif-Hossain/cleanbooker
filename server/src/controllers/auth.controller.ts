import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types";

const prisma = new PrismaClient();

const generateTokens = (businessId: string, email: string) => {
  const accessToken = jwt.sign(
    { businessId, email, role: "admin" },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { businessId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        businessName,
        ownerName,
        email,
        password,
        phone,
        address,
        serviceArea,
      } = req.body;

      // Check if business already exists
      const existingBusiness = await prisma.business.findUnique({
        where: { email },
      });

      if (existingBusiness) {
        sendResponse(
          res,
          false,
          null,
          "Business already exists with this email",
          [],
          409
        );
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create business
      const business = await prisma.business.create({
        data: {
          businessName,
          ownerName,
          email,
          password: hashedPassword,
          phone,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          serviceArea,
        },
        select: {
          id: true,
          businessName: true,
          email: true,
          isVerified: true,
        },
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        business.id,
        business.email
      );

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          businessId: business.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      sendResponse(
        res,
        true,
        {
          user: business,
          token: accessToken,
          refreshToken,
        },
        "Business registered successfully",
        [],
        201
      );
    } catch (error) {
      console.error("Registration error:", error);
      sendResponse(res, false, null, "Registration failed", [], 500);
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find business
      const business = await prisma.business.findUnique({
        where: { email },
        select: {
          id: true,
          businessName: true,
          email: true,
          password: true,
          isVerified: true,
          isActive: true,
        },
      });

      if (!business || !business.isActive) {
        sendResponse(res, false, null, "Invalid credentials", [], 401);
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, business.password);
      if (!isValidPassword) {
        sendResponse(res, false, null, "Invalid credentials", [], 401);
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        business.id,
        business.email
      );

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          businessId: business.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      sendResponse(
        res,
        true,
        {
          user: {
            id: business.id,
            businessName: business.businessName,
            email: business.email,
            isVerified: business.isVerified,
          },
          token: accessToken,
          refreshToken,
        },
        "Login successful"
      );
    } catch (error) {
      console.error("Login error:", error);
      sendResponse(res, false, null, "Login failed", [], 500);
    }
  },

  refresh: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        sendResponse(res, false, null, "Refresh token required", [], 401);
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;

      // Check if token exists in database and is not revoked
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { business: true },
      });

      if (
        !tokenRecord ||
        tokenRecord.isRevoked ||
        tokenRecord.expiresAt < new Date()
      ) {
        sendResponse(res, false, null, "Invalid refresh token", [], 401);
        return;
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        tokenRecord.business.id,
        tokenRecord.business.email
      );

      // Revoke old refresh token and create new one
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { isRevoked: true },
        }),
        prisma.refreshToken.create({
          data: {
            token: newRefreshToken,
            businessId: tokenRecord.business.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      sendResponse(
        res,
        true,
        {
          token: accessToken,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      console.error("Token refresh error:", error);
      sendResponse(res, false, null, "Token refresh failed", [], 401);
    }
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { isRevoked: true },
        });
      }

      sendResponse(res, true, null, "Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      sendResponse(res, false, null, "Logout failed", [], 500);
    }
  },

  profile: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const business = await prisma.business.findUnique({
        where: { id: req.business!.id },
        select: {
          id: true,
          businessName: true,
          ownerName: true,
          email: true,
          phone: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          serviceArea: true,
          logoUrl: true,
          website: true,
          description: true,
          businessHours: true,
          isVerified: true,
          createdAt: true,
        },
      });

      sendResponse(res, true, business, "Profile retrieved successfully");
    } catch (error) {
      console.error("Profile error:", error);
      sendResponse(res, false, null, "Failed to retrieve profile", [], 500);
    }
  },
};
