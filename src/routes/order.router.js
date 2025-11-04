import express from "express";
import { updateOrderStatus, getAllOrders, orderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.put("/:id", updateOrderStatus);

router.get('/status', orderStatus)
router.get("/admin", getAllOrders);

export default router;
