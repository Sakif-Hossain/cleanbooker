import { Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest, ServiceQuery } from "../types";

const prisma = new PrismaClient();

export const serviceController = {
  getServices: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "20",
        search,
        category,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query as ServiceQuery;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = Math.min(parseInt(limit), 100);

      const where: any = {
        businessId: req.business!.id,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            addOns: {
              orderBy: {
                name: "asc",
              },
            },
            _count: {
              select: {
                bookings: true,
              },
            },
          },
        }),
        prisma.service.count({ where }),
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
        { services, meta },
        "Services retrieved successfully"
      );
    } catch (error) {
      console.error("Get services error:", error);
      sendResponse(res, false, null, "Failed to retrieve services", [], 500);
    }
  },

  createService: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { addOns, ...serviceData } = req.body;

      const service = await prisma.service.create({
        data: {
          ...serviceData,
          businessId: req.business!.id,
          addOns: addOns?.length
            ? {
                create: addOns.map((addOn: any) => ({
                  name: addOn.name,
                  price: addOn.price,
                  duration: addOn.duration,
                })),
              }
            : undefined,
        },
        include: {
          addOns: {
            orderBy: {
              name: "asc",
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      sendResponse(res, true, service, "Service created successfully", [], 201);
    } catch (error) {
      console.error("Create service error:", error);
      sendResponse(res, false, null, "Failed to create service", [], 500);
    }
  },

  getService: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const service = await prisma.service.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
        include: {
          addOns: {
            orderBy: {
              name: "asc",
            },
          },
          bookings: {
            where: {
              status: {
                in: ["COMPLETED", "IN_PROGRESS"],
              },
            },
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              review: {
                select: {
                  rating: true,
                  comment: true,
                },
              },
            },
            orderBy: {
              scheduledDate: "desc",
            },
            take: 10,
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      if (!service) {
        sendResponse(res, false, null, "Service not found", [], 404);
        return;
      }

      sendResponse(res, true, service, "Service retrieved successfully");
    } catch (error) {
      console.error("Get service error:", error);
      sendResponse(res, false, null, "Failed to retrieve service", [], 500);
    }
  },

  updateService: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { addOns, ...updateData } = req.body;

      const existingService = await prisma.service.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingService) {
        sendResponse(res, false, null, "Service not found", [], 404);
        return;
      }

      const service = await prisma.service.update({
        where: { id },
        data: {
          ...updateData,
          ...(addOns && {
            addOns: {
              deleteMany: {},
              create: addOns.map((addOn: any) => ({
                name: addOn.name,
                price: addOn.price,
                duration: addOn.duration,
              })),
            },
          }),
        },
        include: {
          addOns: {
            orderBy: {
              name: "asc",
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      sendResponse(res, true, service, "Service updated successfully");
    } catch (error) {
      console.error("Update service error:", error);
      sendResponse(res, false, null, "Failed to update service", [], 500);
    }
  },

  deleteService: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const existingService = await prisma.service.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      if (!existingService) {
        sendResponse(res, false, null, "Service not found", [], 404);
        return;
      }

      // Check if service has active bookings
      if (existingService._count.bookings > 0) {
        sendResponse(
          res,
          false,
          null,
          "Cannot delete service with existing bookings. Consider deactivating instead.",
          [],
          400
        );
        return;
      }

      await prisma.service.delete({
        where: { id },
      });

      sendResponse(res, true, null, "Service deleted successfully");
    } catch (error) {
      console.error("Delete service error:", error);
      sendResponse(res, false, null, "Failed to delete service", [], 500);
    }
  },

  toggleServiceStatus: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const existingService = await prisma.service.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingService) {
        sendResponse(res, false, null, "Service not found", [], 404);
        return;
      }

      const service = await prisma.service.update({
        where: { id },
        data: {
          isActive: !existingService.isActive,
        },
        include: {
          addOns: {
            orderBy: {
              name: "asc",
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      sendResponse(
        res,
        true,
        service,
        `Service ${service.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Toggle service status error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to update service status",
        [],
        500
      );
    }
  },
};
