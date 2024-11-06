import express from 'express';
import { getPostLikes, likePost, unlikePost } from '../controllers/likeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Маршрут для получения лайков поста
router.get('/:postId/likes', authMiddleware, getPostLikes);

// Маршрут для лайка поста
router.post('/:postId/like/:userId', authMiddleware, likePost);

// Маршрут для удаления лайка
router.delete('/:postId/unlike/:userId', authMiddleware, unlikePost);

export default router;