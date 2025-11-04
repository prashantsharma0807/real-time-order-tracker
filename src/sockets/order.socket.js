
import { redisSubscriber } from "../config/redis.config.js";

export default function setupOrderSocket(io) {

  io.on("connection", (socket) => {
    console.log(" Client connected:", socket.id);

    socket.on("joinOrderRoom", (orderId) => {
      const room = String(orderId);
      socket.join(room);
      console.log(` Joined room: ${room}`, socket.rooms);
    });

    socket.on("disconnect", () => {
      console.log(" Client disconnected:", socket.id);
    });
  });

  // Redis subscription listener
  redisSubscriber.subscribe("order_updates", (err) => {
    if (err) console.error("Redis subscribe error:", err);
  });

  redisSubscriber.on("message", (channel, message) => {
    const orderData = JSON.parse(message);
    console.log(" Redis message received:", orderData);

    const room = String(orderData.id);
    io.to(room).emit("orderStatus", orderData);
  });
}
