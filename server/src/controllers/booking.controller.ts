import { Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest, BookingQuery } from "../types";

const prisma = new PrismaClient();

export const bookingController = {
  getBookings: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        page = "1",
        limit = "20",
        search,
        status,
        serviceId,
        customerId,
        employeeId,
        startDate,
        endDate,
        sortBy = "scheduledDate",
        sortOrder = "desc",
      } = req.query as BookingQuery;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = Math.min(parseInt(limit), 100);

      const where: any = {
        businessId: req.business!.id,
      };

      if (search) {
        where.OR = [
          {
            customer: { firstName: { contains: search, mode: "insensitive" } },
          },
          { customer: { lastName: { contains: search, mode: "insensitive" } } },
          { customer: { email: { contains: search, mode: "insensitive" } } },
          { service: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (serviceId) {
        where.serviceId = serviceId;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (startDate || endDate) {
        where.scheduledDate = {};
        if (startDate) {
          where.scheduledDate.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.scheduledDate.lte = new Date(endDate as string);
        }
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                category: true,
                basePrice: true,
                duration: true,
              },
            },
            assignedEmployee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            addOns: {
              include: {
                addOn: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    duration: true,
                  },
                },
              },
            },
            review: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.booking.count({ where }),
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
        { bookings, meta },
        "Bookings retrieved successfully"
      );
    } catch (error) {
      console.error("Get bookings error:", error);
      sendResponse(res, false, null, "Failed to retrieve bookings", [], 500);
    }
  },

  createBooking: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { addOns, ...bookingData } = req.body;

      // Validate customer belongs to business
      const customer = await prisma.customer.findFirst({
        where: {
          id: bookingData.customerId,
          businessId: req.business!.id,
        },
      });

      if (!customer) {
        sendResponse(res, false, null, "Customer not found", [], 404);
        return;
      }

      // Validate service belongs to business
      const service = await prisma.service.findFirst({
        where: {
          id: bookingData.serviceId,
          businessId: req.business!.id,
        },
        include: {
          addOns: true,
        },
      });

      if (!service) {
        sendResponse(res, false, null, "Service not found", [], 404);
        return;
      }

      // Calculate total price
      let totalPrice = service.basePrice;
      let totalDuration = service.duration;

      if (addOns && addOns.length > 0) {
        for (const addOnItem of addOns) {
          const addOn = service.addOns.find(
            (ao) => ao.id === addOnItem.addOnId
          );
          if (addOn) {
            totalPrice = totalPrice.add(addOn.price);
            totalDuration += addOn.duration;
          }
        }
      }

      const booking = await prisma.booking.create({
        data: {
          ...bookingData,
          businessId: req.business!.id,
          totalPrice,
          estimatedDuration: totalDuration,
          addOns: addOns?.length
            ? {
                create: addOns.map((addOnItem: any) => ({
                  addOnId: addOnItem.addOnId,
                  priceAtTime:
                    service.addOns.find((ao) => ao.id === addOnItem.addOnId)
                      ?.price || 0,
                })),
              }
            : undefined,
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              basePrice: true,
              duration: true,
            },
          },
          assignedEmployee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          addOns: {
            include: {
              addOn: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true,
                },
              },
            },
          },
        },
      });

      sendResponse(res, true, booking, "Booking created successfully", [], 201);
    } catch (error) {
      console.error("Create booking error:", error);
      sendResponse(res, false, null, "Failed to create booking", [], 500);
    }
  },

  getBooking: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              propertyType: true,
              propertySize: true,
              specialInstructions: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              basePrice: true,
              duration: true,
            },
          },
          assignedEmployee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          addOns: {
            include: {
              addOn: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true,
                },
              },
            },
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              isPublic: true,
              createdAt: true,
            },
          },
          childBookings: {
            select: {
              id: true,
              scheduledDate: true,
              status: true,
            },
            orderBy: {
              scheduledDate: "asc",
            },
          },
          parentBooking: {
            select: {
              id: true,
              scheduledDate: true,
              recurringType: true,
            },
          },
        },
      });

      if (!booking) {
        sendResponse(res, false, null, "Booking not found", [], 404);
        return;
      }

      sendResponse(res, true, booking, "Booking retrieved successfully");
    } catch (error) {
      console.error("Get booking error:", error);
      sendResponse(res, false, null, "Failed to retrieve booking", [], 500);
    }
  },

  updateBooking: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { addOns, ...updateData } = req.body;

      const existingBooking = await prisma.booking.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingBooking) {
        sendResponse(res, false, null, "Booking not found", [], 404);
        return;
      }

      // Recalculate total price if service or addOns changed
      let recalculatedData = { ...updateData };

      if (updateData.serviceId || addOns) {
        const serviceId = updateData.serviceId || existingBooking.serviceId;
        const service = await prisma.service.findFirst({
          where: { id: serviceId },
          include: { addOns: true },
        });

        if (service) {
          let totalPrice = service.basePrice;
          let totalDuration = service.duration;

          if (addOns && addOns.length > 0) {
            for (const addOnItem of addOns) {
              const addOn = service.addOns.find(
                (ao) => ao.id === addOnItem.addOnId
              );
              if (addOn) {
                totalPrice = totalPrice.add(addOn.price);
                totalDuration += addOn.duration;
              }
            }
          }

          recalculatedData.totalPrice = totalPrice;
          recalculatedData.estimatedDuration = totalDuration;
        }
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          ...recalculatedData,
          ...(addOns && {
            addOns: {
              deleteMany: {},
              create: addOns.map((addOnItem: any) => ({
                addOnId: addOnItem.addOnId,
                priceAtTime: addOnItem.priceAtTime || 0,
              })),
            },
          }),
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              basePrice: true,
              duration: true,
            },
          },
          assignedEmployee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          addOns: {
            include: {
              addOn: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true,
                },
              },
            },
          },
        },
      });

      sendResponse(res, true, booking, "Booking updated successfully");
    } catch (error) {
      console.error("Update booking error:", error);
      sendResponse(res, false, null, "Failed to update booking", [], 500);
    }
  },

  deleteBooking: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const existingBooking = await prisma.booking.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingBooking) {
        sendResponse(res, false, null, "Booking not found", [], 404);
        return;
      }

      // Check if booking can be deleted (not completed or in progress)
      if (
        existingBooking.status === "COMPLETED" ||
        existingBooking.status === "IN_PROGRESS"
      ) {
        sendResponse(
          res,
          false,
          null,
          "Cannot delete completed or in-progress bookings",
          [],
          400
        );
        return;
      }

      await prisma.booking.delete({
        where: { id },
      });

      sendResponse(res, true, null, "Booking deleted successfully");
    } catch (error) {
      console.error("Delete booking error:", error);
      sendResponse(res, false, null, "Failed to delete booking", [], 500);
    }
  },

  updateBookingStatus: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        status,
        actualDuration,
        beforePhotos,
        afterPhotos,
        internalNotes,
      } = req.body;

      const existingBooking = await prisma.booking.findFirst({
        where: {
          id,
          businessId: req.business!.id,
        },
      });

      if (!existingBooking) {
        sendResponse(res, false, null, "Booking not found", [], 404);
        return;
      }

      const updateData: any = { status };

      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
        if (actualDuration) updateData.actualDuration = actualDuration;
        if (beforePhotos) updateData.beforePhotos = beforePhotos;
        if (afterPhotos) updateData.afterPhotos = afterPhotos;
      }

      if (internalNotes) {
        updateData.internalNotes = internalNotes;
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          assignedEmployee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      sendResponse(res, true, booking, "Booking status updated successfully");
    } catch (error) {
      console.error("Update booking status error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to update booking status",
        [],
        500
      );
    }
  },

  getBookingsByDate: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { date } = req.params;
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const bookings = await prisma.booking.findMany({
        where: {
          businessId: req.business!.id,
          scheduledDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              duration: true,
            },
          },
          assignedEmployee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          scheduledDate: "asc",
        },
      });

      sendResponse(
        res,
        true,
        bookings,
        "Bookings for date retrieved successfully"
      );
    } catch (error) {
      console.error("Get bookings by date error:", error);
      sendResponse(res, false, null, "Failed to retrieve bookings", [], 500);
    }
  },
};
