import { redisPublisher } from "../config/redis.config.js";

const orders = [
  { id: "101", customer: "Ravi Kumar", status: "Pending" },
  { id: "102", customer: "Anjali Verma", status: "Shipped" },
  { id: "103", customer: "Amit Singh", status: "Processing" },
  { id: "104", customer: "Priya Sharma", status: "Delivered" },
];

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;

  // publish to Redis
  await redisPublisher.publish("order_updates", JSON.stringify(order));

  res.json({ message: "Order updated", order });
};

export const getAllOrders = (req, res) => {
  res.render("admin", { orders });
};

export const orderStatus = (req, res) => {
  res.render('index');
}