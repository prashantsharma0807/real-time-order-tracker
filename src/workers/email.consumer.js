import amqp from "amqplib";
import nodemailer from "nodemailer";

const startEmailWorker = async () => {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();

        const exchange = "app_events";
        const queue = "email_queue";
        const routingKey = "user.created";

        await channel.assertExchange(exchange, "direct", { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log("Email Worker started and bound to user.created event");


        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: 'pks637700@gmail.com',
                pass: 'zllgtmaiotxmsesd',
            },
        });

        channel.consume(
            queue,
            async (msg) => {
                if (!msg) return;

                const emailData = JSON.parse(msg.content.toString());

                try {
                    await transporter.sendMail({
                        from: '"SIS Team" <yourgmail@gmail.com>',
                        to: emailData.email,
                        subject: emailData.subject,
                        text: emailData.body,
                    });
                    channel.ack(msg);
                } catch (error) {
                    console.error(" Email send failed:", error);
                    channel.nack(msg);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Email Worker Error:", error);
    }
};

startEmailWorker();
