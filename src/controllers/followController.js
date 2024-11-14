import Follow from "../models/followModel.js";
import User from "../models/userModel.js";

// Получение списка подписчиков пользователя
export const getUserFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ followed_user_id: req.params.userId }).populate(
      "follower_user_id",
      "username profile_image"
    );
    res.status(200).json(followers);
  } catch (error) {
    console.error("Error in getUserFollowers:", error);
    res.status(500).json({ error: "Ошибка при получении подписчиков" });
  }
};

// Получение списка, на кого подписан пользователь
export const getUserFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower_user_id: req.params.userId }).populate(
      "followed_user_id",
      "username profile_image"
    );
    res.status(200).json(following);
  } catch (error) {
    console.error("Error in getUserFollowing:", error);
    res.status(500).json({ error: "Ошибка при получении списка подписок" });
  }
};

// Подписка на пользователя
export const followUser = async (req, res) => {
  const { userId, targetUserId } = req.params;

  try {
    // Проверяем, существуют ли пользователи
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Проверяем, не подписан ли уже
    const existingFollow = await Follow.findOne({
      follower_user_id: userId,
      followed_user_id: targetUserId,
    });

    if (existingFollow) {
      return res.status(400).json({ error: "Вы уже подписаны на этого пользователя" });
    }

    // Создаем новую подписку
    const follow = new Follow({
      follower_user_id: userId,
      followed_user_id: targetUserId,
    });

    await follow.save();

    // Обновляем счетчики
    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { following_count: 1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { followers_count: 1 } }),
    ]);

    res.status(201).json(follow);
  } catch (error) {
    console.error("Error in followUser:", error);
    res.status(500).json({ error: "Ошибка при подписке на пользователя" });
  }
};

// Отписка от пользователя
export const unfollowUser = async (req, res) => {
  const { userId, targetUserId } = req.params;

  try {
    const follow = await Follow.findOneAndDelete({
      follower_user_id: userId,
      followed_user_id: targetUserId,
    });

    if (!follow) {
      return res.status(404).json({ error: "Вы не подписаны на этого пользователя" });
    }

    // Обновляем счетчики
    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { following_count: -1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { followers_count: -1 } }),
    ]);

    res.status(200).json({ message: "Вы отписались от пользователя" });
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(500).json({ error: "Ошибка при отписке от пользователя" });
  }
};

// Добавляем новый метод в контроллер
export const recalculateFollows = async (req, res) => {
  try {
    // Получаем всех пользователей
    const users = await User.find({});

    // Обновляем счетчики для каждого пользователя
    for (const user of users) {
      const followersCount = await Follow.countDocuments({
        followed_user_id: user._id,
      });
      const followingCount = await Follow.countDocuments({
        follower_user_id: user._id,
      });

      await User.findByIdAndUpdate(user._id, {
        followers_count: followersCount,
        following_count: followingCount,
      });
    }

    res.status(200).json({ message: "Счетчики обновлены" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Ошибка при обновлении счетчиков" });
  }
};