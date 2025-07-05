import { z } from "zod";

export const registerSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
    country: z.string().default("US"),
  }),
  serviceArea: z.array(z.string()).default([]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  }),
  propertyType: z
    .enum(["HOUSE", "APARTMENT", "OFFICE", "COMMERCIAL"])
    .default("HOUSE"),
  propertySize: z.number().optional(),
  specialInstructions: z.string().optional(),
  preferredContactMethod: z.enum(["EMAIL", "PHONE", "SMS"]).default("EMAIL"),
  status: z.enum(["POTENTIAL", "ACTIVE", "INACTIVE"]).default("POTENTIAL"),
});

// Service validation schemas
export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  description: z.string().max(500).optional(),
  basePrice: z.number().positive("Base price must be positive"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  category: z.enum([
    "REGULAR",
    "DEEP",
    "MOVE_IN",
    "MOVE_OUT",
    "COMMERCIAL",
    "POST_CONSTRUCTION",
  ]),
  isActive: z.boolean().default(true),
  addOns: z
    .array(
      z.object({
        name: z.string().min(1, "Add-on name is required").max(100),
        price: z.number().positive("Add-on price must be positive"),
        duration: z
          .number()
          .int()
          .positive("Add-on duration must be a positive integer"),
      })
    )
    .optional(),
});

export const serviceQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z
    .enum([
      "REGULAR",
      "DEEP",
      "MOVE_IN",
      "MOVE_OUT",
      "COMMERCIAL",
      "POST_CONSTRUCTION",
    ])
    .optional(),
  isActive: z.string().optional(),
  sortBy: z
    .enum(["name", "basePrice", "duration", "category", "createdAt"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Booking validation schemas
export const bookingSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  scheduledDate: z.string().datetime("Invalid scheduled date"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  paymentMethod: z
    .enum(["CASH", "CARD", "CHECK", "ONLINE", "BANK_TRANSFER"])
    .default("CARD"),
  paymentStatus: z
    .enum(["PENDING", "PAID", "PARTIAL", "REFUNDED", "FAILED"])
    .default("PENDING"),
  recurringType: z
    .enum(["NONE", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"])
    .default("NONE"),
  recurringEndDate: z.string().datetime().optional(),
  specialInstructions: z.string().max(1000).optional(),
  internalNotes: z.string().max(1000).optional(),
  employeeId: z.string().uuid().optional(),
  addOns: z
    .array(
      z.object({
        addOnId: z.string().uuid("Invalid add-on ID"),
        priceAtTime: z.number().positive().optional(),
      })
    )
    .optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]),
  actualDuration: z.number().int().positive().optional(),
  beforePhotos: z.array(z.string().url()).optional(),
  afterPhotos: z.array(z.string().url()).optional(),
  internalNotes: z.string().max(1000).optional(),
});

export const bookingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
  serviceId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z
    .enum(["scheduledDate", "createdAt", "totalPrice", "status"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Analytics validation schemas
export const analyticsQuerySchema = z.object({
  period: z.string().optional(), // days
  groupBy: z.enum(["day", "week", "month"]).optional(),
});
