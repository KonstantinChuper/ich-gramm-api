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
  const { postId, userId } = req.params;
  const { comment_text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Пост не найден' });

    const comment = new Comment({
      post_id: postId,
      user_id: userId,
      comment_text,
      created_at: new Date(),
    });

    await comment.save();

    post.comments_count += 1;
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
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