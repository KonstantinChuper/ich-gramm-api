import User from '../models/userModel.js';
import getUserIdFromToken from '../utils/helpers.js';
import multer from 'multer';
import cloudinary from "../config/cloudinary.js";

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage(); // Сохраняем файл в памяти
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Только изображения разрешены"));
    }
  },
});

// controllers/userController.js
export const getCurrentUser = async (req, res) => {
  const userId = getUserIdFromToken(req);
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).select('-password').select('-created_at');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля пользователя', error: error.message });
  }
};

// controllers/userController.js
export const updateUserProfile = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const { username, full_name, bio } = req.body;

    if (username) user.username = username;
    if (full_name) user.full_name = full_name;
    if (bio) user.bio = bio;

    if (req.file) {
      // Если есть старое изображение, удаляем его
      if (user.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id);
      }

      // Преобразуем буфер в base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Загружаем в cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "profiles",
      });

      user.profile_image = result.secure_url;
      user.cloudinary_id = result.public_id;
    }

    const updatedUser = await user.save();
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления профиля", error: error.message });
  }
};

// Экспорт загрузки
export const uploadProfileImage = upload.single('profile_image');
