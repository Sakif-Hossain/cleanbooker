import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ApiResponse } from "../types";

export const sendResponse = <T>(
  res: Response,
  success: boolean,
  data: T | null = null,
  message: string = "",
  errors: string[] = [],
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success,
    data: data || undefined,
    message,
    errors: errors.length > 0 ? errors : undefined,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    },
  };

  res.status(statusCode).json(response);
};
