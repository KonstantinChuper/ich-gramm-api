import express from 'express';
import {
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
  recalculateFollows,
} from "../controllers/followController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Маршрут для получения подписчиков пользователя
router.get('/:userId/followers', authMiddleware, getUserFollowers);

// Маршрут для получения списка, на кого подписан пользователь
router.get('/:userId/following', authMiddleware, getUserFollowing);

// Маршрут для подписки на пользователя
router.post('/:userId/follow/:targetUserId', authMiddleware, followUser);

// Маршрут для отписки от пользователя
router.delete('/:userId/unfollow/:targetUserId', authMiddleware, unfollowUser);

// Пересчёт подписчиков и подписок
router.post('/recalculate', authMiddleware, recalculateFollows);

export default router;