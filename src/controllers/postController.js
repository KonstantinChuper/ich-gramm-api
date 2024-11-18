import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import getUserIdFromToken from "../utils/helpers.js";
import cloudinary from "../config/cloudinary.js";

// Получение всех постов пользователя
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user_id: getUserIdFromToken(req) });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении постов" });
  }
};

// Создание нового поста
export const createPost = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { caption } = req.body;

    console.log("Создание поста. Данные:", { userId, caption });
    console.log("Файл:", req.file); // Проверяем данные файла

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Изображение не предоставлено" });
    }

    // Создаем временный путь для файла
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Загружаем файл в Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "posts",
      resource_type: "auto",
    });

    console.log("Результат загрузки в Cloudinary:", result);

    const post = new Post({
      user_id: userId,
      image_url: result.secure_url,
      cloudinary_id: result.public_id,
      caption: caption || "",
      created_at: new Date(),
    });

    await post.save();

    // Обновляем счетчик постов пользователя
    user.posts_count += 1;
    await user.save();

    res.status(201).json(post);
  } catch (error) {
    console.error("Подробная ошибка:", error);
    res.status(500).json({
      error: "Ошибка при создании поста",
      details: error.message,
    });
  }
};

// Удаление поста
export const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Пост не найден" });

    if (post.cloudinary_id) {
      await cloudinary.uploader.destroy(post.cloudinary_id);
    }

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(post.user_id);
    user.posts_count -= 1;
    await user.save();

    res.status(200).json({ message: "Пост удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении поста" });
  }
};

// Получение поста по ID
export const getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate("user_id", "username");
    if (!post) return res.status(404).json({ error: "Пост не найден" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении поста" });
  }
};

// Обновление поста
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { caption, image_url } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Пост не найден" });

    if (caption !== undefined) post.caption = caption;
    if (image_url !== undefined) post.image_url = image_url;

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при обновлении поста" });
  }
};

// Получение ленты постов для главной страницы
export const getFeedPosts = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    // Получаем текущего пользователя с его подписками
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Получаем ID пользователей, на которых подписан текущий пользователь
    const following = currentUser.following || [];

    // Получаем посты от пользователей, на которых подписан текущий пользователь
    const followingPosts = await Post.find({
      user_id: { $in: following },
    })
      .sort({ created_at: -1 })
      .limit(10);

    // Если постов мало, добавляем популярные посты
    if (followingPosts.length < 10) {
      // Получаем популярные посты (например, с наибольшим количеством лайков)
      const popularPosts = await Post.find({
        user_id: { $nin: [...following, userId] }, // Исключаем посты от тех, на кого подписаны и свои
      })
        .sort({ likes_count: -1 })
        .limit(10 - followingPosts.length);

      // Объединяем посты
      const allPosts = [...followingPosts, ...popularPosts];
      return res.status(200).json({ posts: allPosts });
    }

    res.status(200).json({ posts: followingPosts });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Ошибка при получении ленты" });
  }
};

// Получение постов пользователя по ID
export const getUserPostsById = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user_id: userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении постов" });
  }
};

// Получение постов для страницы explore
export const getExplorePosts = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    // Получаем текущего пользователя с его подписками
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Получаем ID пользователей, на которых подписан текущий пользователь
    const following = currentUser.following || [];

    // Получаем популярные посты, исключая посты от подписок и самого пользователя
    const explorePosts = await Post.find({
      user_id: { $nin: [...following, userId] },
    })
      .populate('user_id', 'username avatar_url')
      .sort({
        likes_count: -1,
        comments_count: -1,
        created_at: -1,
      })
      .limit(30);

    res.status(200).json({ posts: explorePosts });
  } catch (error) {
    console.error("Explore error:", error);
    res.status(500).json({ error: "Ошибка при получении постов для explore" });
  }
};
