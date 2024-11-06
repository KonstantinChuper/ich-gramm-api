import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '3h', // Время действия токена
  });
};

export default generateToken;