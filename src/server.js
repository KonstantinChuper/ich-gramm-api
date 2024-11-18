import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import { Server } from "socket.io";
import { messageSocketHandler, authenticateSocket } from "./routes/messageRoutes.js";
import { notificationSocketHandler } from "./middlewares/notificationSocketHandler.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

// Инициализация WebSocket сервера
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  },
  transports: ["websocket", "polling"],
});

// Сохраняем io в app для доступа из контроллеров
app.set("io", io);

// Middleware для WebSocket-аутентификации
io.use((socket, next) => {
  authenticateSocket(socket, next); // Проверка JWT токена
});

// Обработка WebSocket-соединений
io.on("connection", (socket) => {
  console.log("Новое WebSocket соединение");

  // Подключаем обработчики сообщений
  messageSocketHandler(socket, io);

  // Подключаем обработчики уведомлений
  notificationSocketHandler(socket, io);

  socket.on("disconnect", () => {
    console.log("Клиент отключился");
  });
});
