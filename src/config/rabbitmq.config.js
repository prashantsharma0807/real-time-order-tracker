import amqp from "amqplib";

let connection;
let channel;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    console.log("RabbitMQ connected");

    await channel.assertExchange("app_events", "direct", { durable: true });

    return channel;
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
  }
};

export const getRabbitChannel = async () => {
  if (!channel) await connectRabbitMQ();
  return channel;
};

