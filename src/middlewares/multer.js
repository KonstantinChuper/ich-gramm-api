import multer from 'multer';

// Настройка multer
const storage = multer.memoryStorage(); // Сохраняем файл в памяти
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;