require('dotenv').config({ path: '../.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3001;

let verificationCode = null; // Сохраняем код на уровне приложения
const adminData = { username: 'admin', password: 'password', email: 'direst2010@gmail.com' }; // Замените на adminData.email
let siteContent = { welcomeMessage: 'Welcome to our site!' };

app.use(bodyParser.json());
app.use(cors());

// Проверяем, загружены ли переменные окружения
console.log('Email:', process.env.EMAIL);
console.log('Email Password:', process.env.EMAIL_PASSWORD);

if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1); // Останавливаем сервер, если переменные окружения не загружены
}

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
