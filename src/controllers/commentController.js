import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';

// Получение комментариев к посту
export const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post_id: req.params.postId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении комментариев' });
  }
};

// Создание комментария
export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { comment_text, user_id } = req.body;

  try {
    // Проверяем существование поста
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    // Создаем новый комментарий
    const newComment = new Comment({
      post_id: postId,
      user_id,
      comment_text,
    });

    // Сохраняем комментарий
    const savedComment = await newComment.save();

    // Увеличиваем счетчик комментариев в посте
    await Post.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } });

    // Возвращаем созданный комментарий
    res.status(201).json(savedComment);

  } catch (error) {
    console.error('Server error:', error); // добавляем лог для отладки
    res.status(500).json({ error: 'Ошибка при создании комментария' });
  }
};

// Удаление комментария
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Комментарий не найден' });

    await Comment.findByIdAndDelete(commentId);

    const post = await Post.findById(comment.post_id);
    post.comments_count -= 1;
    await post.save();

    res.status(200).json({ message: 'Комментарий удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении комментария' });
  }
};