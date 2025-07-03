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
