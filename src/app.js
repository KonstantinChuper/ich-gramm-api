import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import followRoutes from './routes/followRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dotenv from "dotenv";
dotenv.config();

// Инициализация приложения Express
const app = express();

// app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Добавьте поддержку для формы с файлами
app.use(express.urlencoded({ extended: true }));

// Middleware для обработки JSON
app.use(express.json());

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);

// Экспорт приложения для использования в server.js
export default app;