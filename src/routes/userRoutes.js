import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getCurrentUser,
} from "../controllers/userController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Обновление профиля пользователя с загрузкой изображения
router.put('/current', authMiddleware, uploadProfileImage, updateUserProfile);

// Получение текущего пользователя
router.get("/current", authMiddleware, getCurrentUser);

// Получение профиля пользователя
router.get('/:userId', getUserProfile);

export default router;