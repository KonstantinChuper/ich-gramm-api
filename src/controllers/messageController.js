import Message from "../models/messageModel.js";

export const loadMessages = async (userId, targetUserId, socket) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: targetUserId },
        { sender_id: targetUserId, receiver_id: userId },
      ],
    }).sort({ created_at: 1 });

    socket.emit("loadMessages", messages);
  } catch (error) {
    console.error("Ошибка при загрузке сообщений:", error);
    socket.emit("error", { error: "Ошибка при загрузке сообщений" });
  }
};

export const sendMessage = async (userId, targetUserId, messageText, roomId, io) => {
  try {
    const message = new Message({
      sender_id: userId,
      receiver_id: targetUserId,
      message_text: messageText,
      created_at: new Date(),
    });

    await message.save();
    io.emit("receiveMessage", message);
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
  }
};

export const getLastMessagesForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender_id: userId }, { receiver_id: userId }],
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender_id", userId] },
              then: "$receiver_id",
              else: "$sender_id",
            },
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
    ]);

    res.json(lastMessages);
  } catch (error) {
    console.error("Ошибка при получении последних сообщений:", error);
    res.status(500).json({ message: "Ошибка при получении последних сообщений" });
  }
};
