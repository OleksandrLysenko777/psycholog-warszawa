require('dotenv').config({ path: '../.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io'); 
const http = require('http');

const app = express();
const port = 3001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Измените на ваш фронтенд URL
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('new_review', (newReview) => {
    console.log('New review received:', newReview);
    io.emit('new_review', newReview);
  });

 socket.on('delete_review', (reviewId) => {
  console.log('Review deleted with id:', reviewId);

  // Удаляем отзыв из массива
  reviews = reviews.filter((review) => review.id !== reviewId);

  // Сохраняем обновленный список отзывов в файл
  fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));

  // Отправляем сообщение об удалении всем подключенным клиентам
  io.emit('review_deleted', reviewId);
  console.log('Review deletion event emitted to all clients');
});


  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


const certificatesFilePath = path.join(__dirname, 'certificates.json');
const avatarsFilePath = path.join(__dirname, 'avatars.json');  // Новый файл для хранения аватаров
const pricesFilePath = path.join(__dirname, 'prices.json');


// Настройка хранения файлов с помощью multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).array('certificates', 10);
const uploadAvatar = multer({ storage: storage }).single('avatar');  // Новый загрузчик для аватара

let verificationCode = null;
let isAdminLoggedIn = false;
const adminData = {
  username: 'admin',
  password: 'password',
  email: 'direst2010@gmail.com',
};

let siteContent = { welcomeMessage: 'Welcome to our site!' };
let prices = {};

let reviews = [];
let certificates = {};
let avatars = {};  // Добавляем пустой объект для аватаров

if (fs.existsSync(pricesFilePath)) {
  try {
    const data = fs.readFileSync(pricesFilePath, 'utf8');
    prices = JSON.parse(data);
    console.log('Prices loaded successfully from prices.json:', prices);
  } catch (err) {
    console.error('Error reading prices.json:', err);
  }
} else {
  // Если файл не существует, создаем его пустым
  prices = {};  // Пустой объект, так как дефолтные цены не нужны
  try {
    fs.writeFileSync(pricesFilePath, JSON.stringify(prices, null, 2));
    console.log('Empty prices.json created');
  } catch (err) {
    console.error('Error creating prices.json:', err);
  }
}
 
// Загрузка сертификатов из файла при старте сервера
if (fs.existsSync(certificatesFilePath)) {
  const data = fs.readFileSync(certificatesFilePath);
  certificates = JSON.parse(data);
} else {
  // Если файл не существует, создаем его
  fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));
}

// Загрузка аватаров из файла при старте сервера
if (fs.existsSync(avatarsFilePath)) {
  const data = fs.readFileSync(avatarsFilePath);
  avatars = JSON.parse(data);
} else {
  // Если файл не существует, создаем его
  fs.writeFileSync(avatarsFilePath, JSON.stringify(avatars, null, 2));
}

const reviewsFilePath = path.join(__dirname, 'reviews.json');
if (!fs.existsSync(reviewsFilePath)) {
  fs.writeFileSync(reviewsFilePath, JSON.stringify([], null, 2));
  console.log('reviews.json created with an empty array');
} else {
  const data = fs.readFileSync(reviewsFilePath, 'utf8');
  try {
    reviews = JSON.parse(data);
  } catch (err) {
    console.error('Error parsing reviews.json:', err);
  }
}

app.use(bodyParser.json());
app.use(cors());

// Логирование и проверка переменных окружения
console.log('Email:', process.env.EMAIL);
console.log('Email Password:', process.env.EMAIL_PASSWORD);

if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

// Функция для отправки email
async function sendMail(email, code) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${code}`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return error;
  }
}

app.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  verificationCode = Math.floor(100000 + Math.random() * 900000); // Генерируем код только один раз
  console.log(`Generated verification code: ${verificationCode} for email: ${email}`);

  try {
    const mailResult = await sendMail(email, verificationCode);
    if (mailResult instanceof Error) {
      throw mailResult;
    }
    console.log(`Verification code sent to ${email}: ${verificationCode}`);
    res.send({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.send({ success: false });
  }
});

app.post('/verify-code', (req, res) => {
  const { code } = req.body;
  console.log(`Verification code received: ${code}`);
  console.log(`Current verification code: ${verificationCode}`);
  if (parseInt(code, 10) === verificationCode) {
    console.log('Verification successful');
    isAdminLoggedIn = true;
    res.send({ success: true });
  } else {
    console.log('Verification failed');
    res.send({ success: false });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt with username: ${username}`);
  if (username === adminData.username && password === adminData.password) {
    console.log('Login successful');
    isAdminLoggedIn = true;
    res.send({ success: true, email: adminData.email });
  } else {
    console.log('Login failed');
    res.send({ success: false });
  }
});

// Middleware для проверки, что админ залогинен
function checkAdminLoggedIn(req, res, next) {
  if (!isAdminLoggedIn) {
    console.log('Unauthorized access attempt');
    return res.status(401).send({ success: false, message: 'Unauthorized' });
  }
  console.log('Admin is logged in, proceeding with the request');
  next();
}

// Эндпоинт для получения отзывов
app.get('/reviews', (req, res) => {
  console.log('Fetching all reviews');
  res.json(reviews);
});

// Новый эндпоинт для добавления отзывов (доступен всем пользователям)
app.post('/add-review', (req, res) => {
  console.log('Received a POST request on /add-review');

  const newReview = req.body;
  console.log('New review received:', newReview);

  reviews.push(newReview);

  // Сохранение отзывов в файл
  fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
  console.log('Review added and saved to file successfully');

  // Отправляем обновленные отзывы всем подключенным клиентам через WebSocket
  io.emit('load_reviews', reviews);

  res.send({ success: true });
});

// Эндпоинт для обновления отзывов (требует авторизации)
app.post('/update-reviews', checkAdminLoggedIn, (req, res) => {
  console.log('Received a POST request on /update-reviews');

  const { reviews: newReviews } = req.body;
  console.log('Data received:', newReviews);

  if (!Array.isArray(newReviews)) {
    console.log('Invalid data format received');
    return res.status(400).send({ success: false, message: 'Invalid reviews data' });
  }

  reviews = newReviews;

  // Сохранение отзывов в файл
  fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
  console.log('Reviews saved to file successfully');

  res.send({ success: true });
});

// Эндпоинт для получения цен
app.get('/prices', (req, res) => {
  console.log('Fetching prices:', prices);
  res.json(prices);
});

// Эндпоинт для обновления цен
app.post('/update-prices', checkAdminLoggedIn, (req, res) => {
  console.log('Получен POST-запрос на /update-prices');
  console.log('Полученные данные:', req.body);

  try {
    // Обновляем объект с ценами
    prices = { ...prices, ...req.body };

    // Записываем обновленные цены в файл JSON
    fs.writeFile(pricesFilePath, JSON.stringify(prices, null, 2), (err) => {
      if (err) {
        console.error('Ошибка при записи в файл prices.json:', err);
        return res.status(500).json({ success: false, message: 'Ошибка при сохранении цен' });
      }
      console.log('Цены успешно обновлены и сохранены в prices.json');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Ошибка при обновлении цен:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});



// Эндпоинт для загрузки сертификатов
app.post('/upload-certificate', checkAdminLoggedIn, (req, res) => {
  upload(req, res, (err) => {
    console.log('Request received:', req.body, req.files);

    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ success: false, message: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ success: false, message: 'Unknown error' });
    }

    if (!req.files || req.files.length === 0) {
      console.warn('No files uploaded');
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { specialistId } = req.body;

    if (!certificates[specialistId]) {
      certificates[specialistId] = [];
    }

    req.files.forEach((file) => {
      certificates[specialistId].push(file.filename);
    });

    // Сохранение сертификатов в файл
    fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));

    res.json({ success: true, filePaths: req.files.map((file) => `/uploads/${file.filename}`) });
  });
});

// Эндпоинт для загрузки аватара
app.post('/upload-avatar', checkAdminLoggedIn, (req, res) => {
  uploadAvatar(req, res, (err) => {
    console.log('Request received for avatar upload:', req.body, req.file);

    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ success: false, message: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ success: false, message: 'Unknown error' });
    }

    if (!req.file) {
      console.warn('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { specialistId } = req.body;

    // Логируем имя файла перед сохранением
    console.log('Filename with extension:', req.file.filename);

    // Удаление предыдущего аватара
    if (avatars[specialistId]) {
      const previousAvatarPath = path.join(__dirname, 'uploads', avatars[specialistId]);
      fs.unlink(previousAvatarPath, (err) => {
        if (err) {
          console.error('Ошибка при удалении предыдущего аватара:', err);
        } else {
          console.log(`Предыдущий аватар ${avatars[specialistId]} успешно удален`);
        }
      });
    }

    // Загрузка аватара для специалиста
    avatars[specialistId] = req.file.filename;

    // Сохранение изменений в avatars.json
    fs.writeFileSync(avatarsFilePath, JSON.stringify(avatars, null, 2));

    // Ответ с путём к загруженному аватару
    res.json({ success: true, avatarPath: `/uploads/${req.file.filename}` });
  });
});

// Эндпоинт для удаления сертификатов
app.post('/delete-certificate', checkAdminLoggedIn, (req, res) => {
  const { filePath, specialistId } = req.body;

  if (!filePath || !specialistId) {
    return res.status(400).send({ success: false, message: 'Invalid filePath or specialistId' });
  }

  const fullPath = path.join(__dirname, 'uploads', path.basename(filePath)); // Используйте path.basename для корректного извлечения имени файла

  fs.unlink(fullPath, (err) => {
    if (err) {
      return res.status(500).send({ success: false, message: 'File deletion error' });
    }

    certificates[specialistId] = certificates[specialistId].filter(
      (cert) => cert !== path.basename(filePath)
    );

    // Сохранение сертификатов в файл
    fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));

    res.send({ success: true });
  });
});

// Предоставление списка сертификатов для всех пользователей
app.get('/certificates/:specialistId', (req, res) => {
  const { specialistId } = req.params;
  res.send({ success: true, certificates: certificates[specialistId] || [] });
});

// Эндпоинт для получения аватара
app.get('/avatar/:specialistId', (req, res) => {
  const { specialistId } = req.params;
  const avatar = avatars[specialistId];  // Используем avatars.json для получения пути к аватару

  if (avatar) {
    res.json({ success: true, avatar: `/uploads/${avatar}` });
  } else {
    res.json({ success: true, avatar: '/uploads/default-avatar.jpg' }); // Если аватара нет, возвращаем дефолтное изображение
  }
});

// Эндпоинт для получения контента сайта
app.get('/content', (req, res) => {
  console.log('Content requested');
  res.send(siteContent);
});

// Эндпоинт для обновления контента сайта
app.post('/update-content', checkAdminLoggedIn, (req, res) => {
  const { content } = req.body;
  console.log('Content update:', content);
  siteContent = content;
  res.send({ success: true });
});

// Статический маршрут для загрузки файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
