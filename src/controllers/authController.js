import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import generateToken from '../config/jwt.js';

// Регистрация пользователя
export const register = async (req, res) => {
  const { username, email, password, full_name } = req.body;

  try {
    // Проверка наличия пользователя с таким же email или именем пользователя
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email или именем уже существует' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const user = new User({
      username,
      email,
      password: hashedPassword,
      full_name
    });

    await user.save();

    // Генерация токена
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка регистрации', error: error.message });
  }
};

// Логин пользователя
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Поиск пользователя по email
    const user = await User.findOne({ username });

    // Добавляем логирование для отладки
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Неверный username или пароль" });
    }

    // Добавляем логирование для отладки
    console.log("Password match:", isMatch ? "Yes" : "No");

    // Генерация токена
    const token = generateToken(user);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Ошибка авторизации', error: error.message });
  }
};