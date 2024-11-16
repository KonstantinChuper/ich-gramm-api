import Message from '../models/messageModel.js';

// Загрузка истории сообщений
export const loadMessages = async (userId, targetUserId, socket) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: targetUserId },
        { sender_id: targetUserId, receiver_id: userId },
      ],
    }).sort({ created_at: 1 }); // Сортировка по времени

    // Отправляем историю сообщений
    socket.emit('loadMessages', messages);
  } catch (error) {
    console.error('Ошибка при загрузке сообщений:', error);
    socket.emit('error', { error: 'Ошибка при загрузке сообщений' });
  }
};

// Отправка сообщения
export const sendMessage = async (userId, targetUserId, messageText, roomId, io) => {
  try {
    const message = new Message({
      sender_id: userId,
      receiver_id: targetUserId,
      message_text: messageText,
      created_at: new Date(),
    });

    await message.save();

    // Отправляем сообщение всем подключенным клиентам
    io.emit("receiveMessage", message); // Изменено с io.to(roomId) на io.emit
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
  }
};