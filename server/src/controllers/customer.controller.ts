import { Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest, CustomerQuery } from "../types";

const prisma = new PrismaClient();

export const customerController = {
  getCustomers: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "20",
        search,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query as CustomerQuery;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = Math.min(parseInt(limit), 100);

      const where: any = {
        businessId: req.business!.id,
      };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      // Get customers with pagination
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
        }),
        prisma.customer.count({ where }),
      ]);

      const meta = {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      };

      sendResponse(
        res,
        true,
        { customers, meta },
        "Customers retrieved successfully"
      );
    } catch (error) {
      console.error("Get customers error:", error);
      sendResponse(res, false, null, "Failed to retrieve customers", [], 500);
    }
  },

  createCustomer: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const customerData = req.body;

      // Check if customer already exists
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: customerData.email,
          businessId: req.business!.id,
        },
      });

      if (existingCustomer) {
        sendResponse(
          res,
          false,
          null,
          "Customer already exists with this email",
          [],
          409
        );
        return;
      }

      const customer = await prisma.customer.create({
        data: {
          ...customerData,
          street: customerData.address.street,
          city: customerData.address.city,
          state: customerData.address.state,
          zipCode: customerData.address.zipCode,
          businessId: req.business!.id,
        },
        include: {
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      });

      sendResponse(
        res,
        true,
        customer,
        "Customer created successfully",
        [],
        201
      );
    } catch (error) {
      console.error("Create customer error:", error);
      sendResponse(res, false, null, "Failed to create customer", [], 500);
    }
  },

  getCustomer: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
        include: {
          bookings: {
            include: {
              service: true,
              review: true,
            },
            orderBy: {
              scheduledDate: "desc",
            },
          },
          notes: {
            orderBy: {
              createdAt: "desc",
            },
          },
          reviews: {
            include: {
              booking: {
                include: {
                  service: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      });

      if (!customer) {
        sendResponse(res, false, null, "Customer not found", [], 404);
        return;
      }

      sendResponse(res, true, customer, "Customer retrieved successfully");
    } catch (error) {
      console.error("Get customer error:", error);
      sendResponse(res, false, null, "Failed to retrieve customer", [], 500);
    }
  },

  updateCustomer: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if customer exists and belongs to business
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingCustomer) {
        sendResponse(res, false, null, "Customer not found", [], 404);
        return;
      }

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.address && {
            street: updateData.address.street,
            city: updateData.address.city,
            state: updateData.address.state,
            zipCode: updateData.address.zipCode,
          }),
        },
        include: {
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      });

      sendResponse(res, true, customer, "Customer updated successfully");
    } catch (error) {
      console.error("Update customer error:", error);
      sendResponse(res, false, null, "Failed to update customer", [], 500);
    }
  },

  deleteCustomer: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if customer exists and belongs to business
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingCustomer) {
        sendResponse(res, false, null, "Customer not found", [], 404);
        return;
      }

      await prisma.customer.delete({
        where: { id },
      });

      sendResponse(res, true, null, "Customer deleted successfully");
    } catch (error) {
      console.error("Delete customer error:", error);
      sendResponse(res, false, null, "Failed to delete customer", [], 500);
    }
  },
};
