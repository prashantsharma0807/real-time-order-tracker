import { getRabbitChannel } from "../config/rabbitmq.config.js";

export const publishEvent = async (routingKey, data) => {
    try {
        const channel = await getRabbitChannel();
        const exchange = "app_events";

        await channel.assertExchange(exchange, "direct", { durable: true });

        const message = JSON.stringify(data);

        channel.publish(exchange, routingKey, Buffer.from(message), {
            persistent: true,
        });

    } catch (error) {
        console.error(" Failed to publish event:", error);
    }
};
