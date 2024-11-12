import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getCurrentUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Обработчик ошибок multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Файл слишком большой" });
    }
  }
  next(err);
};

// Обновление профиля пользователя с загрузкой изображения
router.put("/current", authMiddleware, uploadProfileImage, handleMulterError, updateUserProfile);

// Получение текущего пользователя
router.get("/current", authMiddleware, getCurrentUser);

// Получение профиля пользователя
router.get("/:userId", getUserProfile);
  
export default router;
