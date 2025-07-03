import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendResponse } from "../utils/response";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );
        sendResponse(res, false, null, "Validation failed", errors, 422);
      } else {
        sendResponse(res, false, null, "Validation error", [], 400);
      }
    }
  };
};
