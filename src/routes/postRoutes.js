import express from 'express';
import upload from '../middlewares/multer.js';
import { createPost, getPostById, updatePost, deletePost, getUserPosts, getFeedPosts, getUserPostsById, getExplorePosts } from '../controllers/postController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Создание нового поста
router.post('/', authMiddleware, upload.single('image'), createPost);

// Получение поста по ID
router.get('/single/:postId', authMiddleware, getPostById);

// Обновление поста
router.put('/:postId', authMiddleware, updatePost);

// Удаление поста
router.delete('/:postId', authMiddleware, deletePost);

// Получение всех постов пользователя
router.get('/all', authMiddleware, getUserPosts);

// Получение ленты постов для главной страницы
router.get("/feed", authMiddleware, getFeedPosts);

// Получение постов конкретного пользователя
router.get('/user/:userId', authMiddleware, getUserPostsById);

// Получение постов для explore
router.get('/explore', authMiddleware, getExplorePosts);

export default router;