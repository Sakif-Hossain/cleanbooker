import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  business?: {
    id: string;
    businessName: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface CustomerQuery extends PaginationQuery {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ServiceQuery = z.infer<typeof serviceQuerySchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
