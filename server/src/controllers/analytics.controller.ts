import { Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types";

const prisma = new PrismaClient();

export const analyticsController = {
  getDashboardStats: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { period = "30" } = req.query;
      const daysAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [
        totalBookings,
        totalRevenue,
        totalCustomers,
        activeServices,
        completedBookings,
        cancelledBookings,
        averageRating,
        totalReviews,
      ] = await Promise.all([
        // Total bookings in period
        prisma.booking.count({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
          },
        }),
        // Total revenue in period
        prisma.booking.aggregate({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
            status: "COMPLETED",
          },
          _sum: {
            totalPrice: true,
          },
        }),
        // Total customers in period
        prisma.customer.count({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
          },
        }),
        // Active services count
        prisma.service.count({
          where: {
            businessId: req.business!.id,
            isActive: true,
          },
        }),
        // Completed bookings in period
        prisma.booking.count({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
            status: "COMPLETED",
          },
        }),
        // Cancelled bookings in period
        prisma.booking.count({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
            status: "CANCELLED",
          },
        }),
        // Average rating
        prisma.review.aggregate({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
          },
          _avg: {
            rating: true,
          },
        }),
        // Total reviews in period
        prisma.review.count({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: startDate },
          },
        }),
      ]);

      const stats = {
        totalBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        totalCustomers,
        activeServices,
        completedBookings,
        cancelledBookings,
        averageRating: averageRating._avg.rating || 0,
        totalReviews,
        completionRate:
          totalBookings > 0
            ? ((completedBookings / totalBookings) * 100).toFixed(1)
            : 0,
        cancellationRate:
          totalBookings > 0
            ? ((cancelledBookings / totalBookings) * 100).toFixed(1)
            : 0,
      };

      sendResponse(
        res,
        true,
        stats,
        "Dashboard statistics retrieved successfully"
      );
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to retrieve dashboard statistics",
        [],
        500
      );
    }
  },

  getRevenueAnalytics: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { period = "30", groupBy = "day" } = req.query;
      const daysAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Revenue by time period
      const revenueData = await prisma.booking.findMany({
        where: {
          businessId: req.business!.id,
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
        select: {
          totalPrice: true,
          scheduledDate: true,
        },
        orderBy: {
          scheduledDate: "asc",
        },
      });

      // Group revenue by period
      const revenueByPeriod = revenueData.reduce((acc: any, booking) => {
        const date = booking.scheduledDate;
        let key: string;

        if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else if (groupBy === "month") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        } else {
          key = date.toISOString().split("T")[0];
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            revenue: 0,
            bookings: 0,
          };
        }

        acc[key].revenue += parseFloat(booking.totalPrice.toString());
        acc[key].bookings += 1;

        return acc;
      }, {});

      // Revenue by service
      const revenueByService = await prisma.booking.groupBy({
        by: ["serviceId"],
        where: {
          businessId: req.business!.id,
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
        _sum: {
          totalPrice: true,
        },
        _count: {
          id: true,
        },
      });

      // Get service names
      const serviceIds = revenueByService.map((item) => item.serviceId);
      const services = await prisma.service.findMany({
        where: {
          id: { in: serviceIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const serviceRevenueData = revenueByService.map((item) => ({
        serviceId: item.serviceId,
        serviceName:
          services.find((s) => s.id === item.serviceId)?.name || "Unknown",
        revenue: item._sum.totalPrice || 0,
        bookings: item._count.id,
      }));

      sendResponse(
        res,
        true,
        {
          revenueByPeriod: Object.values(revenueByPeriod),
          revenueByService: serviceRevenueData,
        },
        "Revenue analytics retrieved successfully"
      );
    } catch (error) {
      console.error("Get revenue analytics error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to retrieve revenue analytics",
        [],
        500
      );
    }
  },

  getBookingAnalytics: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { period = "30" } = req.query;
      const daysAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Bookings by status
      const bookingsByStatus = await prisma.booking.groupBy({
        by: ["status"],
        where: {
          businessId: req.business!.id,
          createdAt: { gte: startDate },
        },
        _count: {
          id: true,
        },
      });

      // Bookings by service
      const bookingsByService = await prisma.booking.groupBy({
        by: ["serviceId"],
        where: {
          businessId: req.business!.id,
          createdAt: { gte: startDate },
        },
        _count: {
          id: true,
        },
      });

      // Get service names
      const serviceIds = bookingsByService.map((item) => item.serviceId);
      const services = await prisma.service.findMany({
        where: {
          id: { in: serviceIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const serviceBookingData = bookingsByService.map((item) => ({
        serviceId: item.serviceId,
        serviceName:
          services.find((s) => s.id === item.serviceId)?.name || "Unknown",
        bookings: item._count.id,
      }));

      // Peak booking times
      const peakTimes = await prisma.booking.findMany({
        where: {
          businessId: req.business!.id,
          createdAt: { gte: startDate },
        },
        select: {
          scheduledDate: true,
        },
      });

      const hourlyBookings = peakTimes.reduce((acc: any, booking) => {
        const hour = booking.scheduledDate.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const dailyBookings = peakTimes.reduce((acc: any, booking) => {
        const day = booking.scheduledDate.getDay();
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayName = dayNames[day];
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {});

      sendResponse(
        res,
        true,
        {
          bookingsByStatus,
          bookingsByService: serviceBookingData,
          peakHours: Object.entries(hourlyBookings).map(([hour, count]) => ({
            hour: parseInt(hour),
            bookings: count,
          })),
          peakDays: Object.entries(dailyBookings).map(([day, count]) => ({
            day,
            bookings: count,
          })),
        },
        "Booking analytics retrieved successfully"
      );
    } catch (error) {
      console.error("Get booking analytics error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to retrieve booking analytics",
        [],
        500
      );
    }
  },

  getCustomerAnalytics: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { period = "30" } = req.query;
      const daysAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Customer acquisition over time
      const customerAcquisition = await prisma.customer.findMany({
        where: {
          businessId: req.business!.id,
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const acquisitionByDate = customerAcquisition.reduce(
        (acc: any, customer) => {
          const date = customer.createdAt.toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {}
      );

      // Customer lifetime value
      const customerLTV = await prisma.customer.findMany({
        where: {
          businessId: req.business!.id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              bookings: true,
            },
          },
          bookings: {
            where: {
              status: "COMPLETED",
            },
            select: {
              totalPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });

      const customerLTVData = customerLTV.map((customer) => ({
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        totalBookings: customer._count.bookings,
        totalRevenue: customer.bookings.reduce(
          (sum, booking) => sum + parseFloat(booking.totalPrice.toString()),
          0
        ),
        averageBookingValue:
          customer.bookings.length > 0
            ? customer.bookings.reduce(
                (sum, booking) =>
                  sum + parseFloat(booking.totalPrice.toString()),
                0
              ) / customer.bookings.length
            : 0,
        customerSince: customer.createdAt,
      }));

      // Customer retention rate
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [newCustomers, returningCustomers] = await Promise.all([
        prisma.customer.count({
          where: {
            businessId: req.business!.id,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        prisma.customer.count({
          where: {
            businessId: req.business!.id,
            createdAt: { lte: sixtyDaysAgo },
            bookings: {
              some: {
                createdAt: { gte: thirtyDaysAgo },
              },
            },
          },
        }),
      ]);

      const totalOldCustomers = await prisma.customer.count({
        where: {
          businessId: req.business!.id,
          createdAt: { lte: sixtyDaysAgo },
        },
      });

      const retentionRate =
        totalOldCustomers > 0
          ? ((returningCustomers / totalOldCustomers) * 100).toFixed(1)
          : 0;

      sendResponse(
        res,
        true,
        {
          customerAcquisition: Object.entries(acquisitionByDate).map(
            ([date, count]) => ({
              date,
              newCustomers: count,
            })
          ),
          customerLTV: customerLTVData,
          retentionMetrics: {
            newCustomers,
            returningCustomers,
            retentionRate: parseFloat(retentionRate as string),
          },
        },
        "Customer analytics retrieved successfully"
      );
    } catch (error) {
      console.error("Get customer analytics error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to retrieve customer analytics",
        [],
        500
      );
    }
  },

  getPerformanceMetrics: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { period = "30" } = req.query;
      const daysAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Employee performance
      const employeePerformance = await prisma.employee.findMany({
        where: {
          businessId: req.business!.id,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          _count: {
            select: {
              bookings: true,
            },
          },
          bookings: {
            where: {
              createdAt: { gte: startDate },
              status: "COMPLETED",
            },
            select: {
              totalPrice: true,
              review: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      });

      const employeeData = employeePerformance.map((employee) => {
        const completedBookings = employee.bookings.length;
        const totalRevenue = employee.bookings.reduce(
          (sum, booking) => sum + parseFloat(booking.totalPrice.toString()),
          0
        );
        const ratings = employee.bookings
          .filter((b) => b.review)
          .map((b) => b.review!.rating);
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;

        return {
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          completedBookings,
          totalRevenue,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalBookings: employee._count.bookings,
        };
      });

      // Service performance
      const servicePerformance = await prisma.service.findMany({
        where: {
          businessId: req.business!.id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          category: true,
          basePrice: true,
          _count: {
            select: {
              bookings: true,
            },
          },
          bookings: {
            where: {
              createdAt: { gte: startDate },
              status: "COMPLETED",
            },
            select: {
              totalPrice: true,
              review: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      });

      const serviceData = servicePerformance.map((service) => {
        const completedBookings = service.bookings.length;
        const totalRevenue = service.bookings.reduce(
          (sum, booking) => sum + parseFloat(booking.totalPrice.toString()),
          0
        );
        const ratings = service.bookings
          .filter((b) => b.review)
          .map((b) => b.review!.rating);
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;

        return {
          serviceId: service.id,
          serviceName: service.name,
          category: service.category,
          basePrice: service.basePrice,
          completedBookings,
          totalRevenue,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalBookings: service._count.bookings,
        };
      });

      sendResponse(
        res,
        true,
        {
          employeePerformance: employeeData,
          servicePerformance: serviceData,
        },
        "Performance metrics retrieved successfully"
      );
    } catch (error) {
      console.error("Get performance metrics error:", error);
      sendResponse(
        res,
        false,
        null,
        "Failed to retrieve performance metrics",
        [],
        500
      );
    }
  },
};
