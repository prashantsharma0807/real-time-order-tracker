import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.config.js';
import authRoutes from './routes/auth.router.js';
import orderRouter from './routes/order.router.js';
import setupOrderSocket from './sockets/order.socket.js';
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import path from "path";
import { fileURLToPath } from "url";
import "./config/redis.config.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express()
const server = http.createServer(app)

//const io = new Server(server)
const io = new Server(server, {
  cors: { origin: "*" }
});

setupOrderSocket(io)

connectDB()

await connectRabbitMQ();

app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "views")));

app.use('/auth', authRoutes)
app.use('/order', orderRouter)

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


server.listen(process.env.PORT, () => { console.log('Server is Runing') })