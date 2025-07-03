import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { customerSchema } from "../utils/validation";

const router = Router();

// All customer routes require authentication
router.use(authenticateToken);

router.get("/", customerController.getCustomers);
router.post(
  "/",
  validateRequest(customerSchema),
  customerController.createCustomer
);
router.get("/:id", customerController.getCustomer);
router.put(
  "/:id",
  validateRequest(customerSchema.partial()),
  customerController.updateCustomer
);
router.delete("/:id", customerController.deleteCustomer);

export default router;
