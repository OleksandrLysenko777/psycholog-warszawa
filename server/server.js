require('dotenv').config({ path: '../.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

const upload = multer({ dest: 'uploads/' });

let verificationCode = null;
let isAdminLoggedIn = false;
const adminData = {
  username: 'admin',
  password: 'password',
  email: 'direst2010@gmail.com',
};
let siteContent = { welcomeMessage: 'Welcome to our site!' };

let prices = {
  individualTherapy: '200 PLN',
  adolescentTherapy: '180 PLN',
  groupTherapy: '150 PLN',
  crisisIntervention: '220 PLN',
};

app.use(bodyParser.json());
app.use(cors());

// Проверка загруженных переменных окружения
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
  console.log(
    `Generated verification code: ${verificationCode} for email: ${email}`
  );

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
    res.send({ success: true, email: adminData.email });
  } else {
    console.log('Login failed');
    res.send({ success: false });
  }
});

// Middleware для проверки, что админ залогинен
function checkAdminLoggedIn(req, res, next) {
  if (!isAdminLoggedIn) {
    return res.status(401).send({ success: false, message: 'Unauthorized' });
  }
  next();
}

// Эндпоинт для получения цен
app.get('/prices', (req, res) => {
  res.json(prices);
});

// Эндпоинт для обновления цен (доступен только залогированным админам)
app.post('/prices', checkAdminLoggedIn, (req, res) => {
  prices = req.body;
  res.send({ success: true });
});

// Обработка загрузки сертификатов
app.post(
  '/upload-certificate',
  checkAdminLoggedIn,
  upload.single('certificate'),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .send({ success: false, message: 'No file uploaded' });
    }

    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, 'uploads', req.file.originalname);

    fs.rename(tempPath, targetPath, err => {
      if (err)
        return res
          .status(500)
          .send({ success: false, message: 'File processing error' });

      res.send({
        success: true,
        filePath: `/uploads/${req.file.originalname}`,
      });
    });
  }
);

// Обработка удаления сертификатов
app.post('/delete-certificate', checkAdminLoggedIn, (req, res) => {
  const { filePath } = req.body;
  const fullPath = path.join(__dirname, filePath);

  fs.unlink(fullPath, err => {
    if (err)
      return res
        .status(500)
        .send({ success: false, message: 'File deletion error' });

    res.send({ success: true });
  });
});

// Предоставление списка сертификатов для всех пользователей
app.get('/certificates', (req, res) => {
  const certificatesDir = path.join(__dirname, 'uploads');
  fs.readdir(certificatesDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .send({ success: false, message: 'Unable to retrieve certificates' });
    }
    const filePaths = files.map(file => `/uploads/${file}`);
    res.send({ success: true, certificates: filePaths });
  });
});

app.get('/content', (req, res) => {
  console.log('Content requested');
  res.send(siteContent);
});

app.post('/update-content', (req, res) => {
  const { content } = req.body;
  console.log('Content update:', content);
  siteContent = content;
  res.send({ success: true });
});

// Статический маршрут для загрузки файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
