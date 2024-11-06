import jwt from 'jsonwebtoken';
import { loadMessages, sendMessage } from '../controllers/messageController.js';
import User from '../models/userModel.js';

// Проверка JWT токена для WebSocket
export const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token; // Извлекаем токен из handshake.auth

  if (!token) {
    return next(new Error('Доступ запрещен. Токен не предоставлен.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id);

    if (!user) {
      return next(new Error('Пользователь не найден.'));
    }

    // Добавляем проверенного пользователя в socket
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error('Неверный токен.'));
  }
};

// Обработка WebSocket событий
export const messageSocketHandler = (socket, io) => {
  // Подключение пользователя к комнате
  socket.on('joinRoom', ({ targetUserId }) => {
    const userId = socket.user._id; // Используем userId из проверенного токена
    const roomId = [userId, targetUserId].sort().join('_');
    socket.join(roomId);

    // Загрузка истории сообщений при подключении
    loadMessages(userId, targetUserId, socket);
  });

  // Отправка сообщений
  socket.on('sendMessage', ({ targetUserId, messageText }) => {
    const userId = socket.user._id; // Используем userId из токена
    const roomId = [userId, targetUserId].sort().join('_');
    sendMessage(userId, targetUserId, messageText, roomId, io);
  });

  // Отключение пользователя
  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
};