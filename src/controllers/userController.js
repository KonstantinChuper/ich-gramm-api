import User from '../models/userModel.js';
import getUserIdFromToken from '../utils/helpers.js';
import multer from 'multer';

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage(); // Сохраняем файл в памяти
const upload = multer({ storage });

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

// Обновить профиль пользователя
export const updateUserProfile = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Извлекаем поля из req.body
    const { username, full_name, bio } = req.body;

    // Обновляем поля пользователя
    if (username) user.username = username;
    if (full_name) user.full_name = full_name;
    if (bio) user.bio = bio;

    // Если передано изображение, преобразуем его в Base64
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64'); // Преобразуем файл в Base64
      user.profile_image = base64Image;
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: error.message });
  }
};

// Экспорт загрузки
export const uploadProfileImage = upload.single('profile_image');
