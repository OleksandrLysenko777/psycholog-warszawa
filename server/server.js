require('dotenv').config({ path: '../.env' });

const express   = require('express');
const bodyParser= require('body-parser');
const cors      = require('cors');
const nodemailer= require('nodemailer');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const { Server }= require('socket.io');
const http      = require('http');
const jwt       = require('jsonwebtoken');

/* ===================== ENV ===================== */
const PORT           = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN  = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@example.com';

const JWT_SECRET     = process.env.JWT_SECRET     || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/* ================== APP / SOCKET ================= */
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

/* =================== MIDDLEWARES ================= */
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

/* uploads dir (гарантируем наличие) */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/* Раздача /uploads (расположить высоко) */
app.use('/uploads', express.static(uploadsDir));

/* ===================== FILE PATHS ===================== */
const translationFiles = {
  pl: path.join(__dirname, '../src/locales/pl.json'),
  ua: path.join(__dirname, '../src/locales/ua.json'),
};

const certificatesFilePath = path.join(__dirname, 'certificates.json');
const avatarsFilePath      = path.join(__dirname, 'avatars.json');
const pricesFilePath       = path.join(__dirname, 'prices.json');
const reviewsFilePath      = path.join(__dirname, 'reviews.json');
const sectionsFilePath     = path.join(__dirname, 'sections.json');

/* ===================== MULTER ===================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload        = multer({ storage }).array('certificates', 10);
const uploadAvatar  = multer({ storage }).single('avatar');
const uploadSection = multer({ storage }).single('image');

/* ===================== IN-MEMORY ===================== */
let verificationCode = null;

let siteContent   = { welcomeMessage: 'Welcome to our site!' };
let prices        = {};
let reviews       = [];
let certificates  = {};
let avatars       = {};
let sectionImages = [];

/* ===================== LOAD DATA ===================== */
function safeLoadJSON(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) {
    console.error(`Error reading ${path.basename(file)}:`, e);
    return fallback;
  }
}

prices        = safeLoadJSON(pricesFilePath, {});
certificates  = safeLoadJSON(certificatesFilePath, {});
avatars       = safeLoadJSON(avatarsFilePath, {});
reviews       = safeLoadJSON(reviewsFilePath, []);
sectionImages = safeLoadJSON(sectionsFilePath, []);

/* ===================== HELPERS: FILES & CLEANUP ===================== */
function fileExistsSafe(absPath) {
  try { fs.accessSync(absPath, fs.constants.F_OK); return true; }
  catch { return false; }
}

/** Удаляет «висячие» записи из certificates.json; возвращает отчёт по удалённым позициям */
function reconcileCertificates() {
  const report = { changed: false, removedBySpecialist: {} };
  for (const [specId, files] of Object.entries(certificates)) {
    const original = Array.isArray(files) ? files : [];
    const filtered = original.filter(name => fileExistsSafe(path.join(uploadsDir, name)));
    const removed  = original.length - filtered.length;
    if (removed > 0) {
      certificates[specId] = filtered;
      report.changed = true;
      report.removedBySpecialist[specId] = removed;
    }
  }
  if (report.changed) {
    fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));
    console.log('[certificates] cleaned dangling entries:', report.removedBySpecialist);
  }
  return report;
}
// Разовая чистка на старте
reconcileCertificates();

/* ===================== EMAIL (опционально) ===================== */
if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  console.warn('[WARN] EMAIL / EMAIL_PASSWORD не заданы. Почтовые функции работать не будут.');
}

async function sendMail(email, code) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });
    return await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${code}`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return error;
  }
}

/* ===================== AUTH HELPERS ===================== */
const signAdminToken = () =>
  jwt.sign({ role: 'admin', username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const extractBearer = (req) => {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
};

/* dev-фолбэк: поддержка старого admin-token-123, чтобы не ломать процесс миграции */
function checkAdminLoggedIn(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (authHeader === 'Bearer admin-token-123') {
    console.warn('[AUTH] Using legacy admin-token-123 (dev fallback).');
    return next();
  }
  const token = extractBearer(req);
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('Bad role');
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

/* ===================== SOCKET.IO ===================== */
io.on('connection', (socket) => {
  socket.on('add_review', (newReview) => {
    reviews.push(newReview);
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
    io.emit('new_review', newReview);
  });

  socket.on('delete_review', (reviewId) => {
    reviews = reviews.filter((r) => r.id !== reviewId);
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
    io.emit('review_deleted', reviewId);
  });
});

/* ===================== AUTH API ===================== */
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = signAdminToken(); // выдаём сразу (обратная совместимость)
    return res.json({ success: true, email: ADMIN_EMAIL, token });
  }
  res.json({ success: false });
});

app.post('/send-verification-code', async (req, res) => {
  const { email } = req.body || {};
  verificationCode = Math.floor(100000 + Math.random() * 900000);
  try {
    const mailResult = await sendMail(email, verificationCode);
    if (mailResult instanceof Error) throw mailResult;
    res.json({ success: true });
  } catch (e) {
    console.error('Error sending email:', e);
    res.json({ success: false });
  }
});

app.post('/verify-code', (req, res) => {
  const { code } = req.body || {};
  if (parseInt(code, 10) === verificationCode) {
    // предпочтительно выдавать токен здесь — после 2FA
    return res.json({ success: true, token: signAdminToken() });
  }
  res.json({ success: false });
});

/* ===================== SECTIONS ===================== */
app.get('/sections', (req, res) => {
  res.json({ success: true, sections: sectionImages });
});

app.post('/upload-section-image', checkAdminLoggedIn, (req, res) => {
  uploadSection(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      console.error('Section upload error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Upload error' });
    }

    const { sectionId } = req.body || {};
    if (!req.file || !sectionId) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const tempPath  = path.join(uploadsDir, req.file.filename);
    const ext       = path.extname(req.file.originalname) || '.jpg';
    const finalName = `${sectionId}${ext}`;
    const finalPath = path.join(uploadsDir, finalName);

    let oldImageAbsPath = null;
    let found = false;

    sectionImages = sectionImages.map((s) => {
      if (s.id === sectionId) {
        found = true;
        if (s.image && s.image.startsWith('/uploads/')) {
          oldImageAbsPath = path.join(__dirname, s.image);
        }
        return { ...s, image: `/uploads/${finalName}` };
      }
      return s;
    });
    if (!found) sectionImages.push({ id: sectionId, image: `/uploads/${finalName}` });

    try {
      fs.renameSync(tempPath, finalPath);
    } catch (e) {
      console.error('Rename error:', e);
      try { fs.unlinkSync(tempPath); } catch {}
      return res.status(500).json({ success: false, message: 'File save error' });
    }

    if (oldImageAbsPath && path.normalize(oldImageAbsPath) !== path.normalize(finalPath)) {
      try { if (fs.existsSync(oldImageAbsPath)) fs.unlinkSync(oldImageAbsPath); }
      catch (e) { console.warn('Cleanup old section image failed:', e.message); }
    }

    fs.writeFileSync(sectionsFilePath, JSON.stringify(sectionImages, null, 2), 'utf-8');
    res.json({ success: true, imagePath: `/uploads/${finalName}` });
  });
});

app.post('/update-sections', checkAdminLoggedIn, (req, res) => {
  const { sections } = req.body || {};
  if (!Array.isArray(sections)) {
    return res.status(400).json({ success: false, message: 'Invalid sections data' });
  }
  sectionImages = sections;
  fs.writeFileSync(sectionsFilePath, JSON.stringify(sectionImages, null, 2));
  res.json({ success: true });
});

/* ===================== REVIEWS / PRICES / CONTENT ===================== */
app.get('/reviews', (req, res) => res.json(reviews));

app.get('/prices',  (req, res) => res.json(prices));

app.post('/update-prices', checkAdminLoggedIn, (req, res) => {
  try {
    prices = { ...prices, ...req.body };
    fs.writeFile(pricesFilePath, JSON.stringify(prices, null, 2), (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Ошибка при сохранении цен' });
      res.json({ success: true });
    });
  } catch {
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

/* ===================== CERTIFICATES ===================== */
app.get('/certificates/:specialistId', (req, res) => {
  const { specialistId } = req.params;
  // На лету фильтруем «мертвые» ссылки
  const list = (certificates[specialistId] || []);
  const filtered = list.filter(name => fileExistsSafe(path.join(uploadsDir, name)));
  if (filtered.length !== list.length) {
    certificates[specialistId] = filtered;
    fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));
    console.log(`[certificates] cleaned ${specialistId}: ${list.length - filtered.length} missing file(s)`);
  }
  res.json({ success: true, certificates: filtered });
});

app.post('/upload-certificate', checkAdminLoggedIn, (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Unknown error' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { specialistId } = req.body || {};
    if (!certificates[specialistId]) certificates[specialistId] = [];
    req.files.forEach((f) => certificates[specialistId].push(f.filename));
    fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));

    res.json({ success: true, filePaths: req.files.map((f) => `/uploads/${f.filename}`) });
  });
});

app.post('/delete-certificate', checkAdminLoggedIn, (req, res) => {
  const { filePath, specialistId } = req.body || {};
  if (!filePath || !specialistId) {
    return res.status(400).json({ success: false, message: 'Invalid filePath or specialistId' });
  }

  const filename = path.basename(filePath);
  const absPath  = path.join(uploadsDir, filename);

  // Пытаемся удалить физический файл, но если его уже нет — всё равно считаем операцию успешной
  try {
    if (fileExistsSafe(absPath)) fs.unlinkSync(absPath);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error('File deletion error:', e);
      return res.status(500).json({ success: false, message: 'File deletion error' });
    }
  }

  // В любом случае удаляем запись из JSON
  certificates[specialistId] = (certificates[specialistId] || []).filter((c) => c !== filename);
  fs.writeFileSync(certificatesFilePath, JSON.stringify(certificates, null, 2));

  return res.json({ success: true });
});

/* ---- ручной maintenance-роут для чистки dangling-ссылок ---- */
app.post('/admin/cleanup-certificates', checkAdminLoggedIn, (req, res) => {
  const report = reconcileCertificates();
  res.json({ success: true, ...report, certificates });
});

/* ===================== AVATAR ===================== */
app.get('/avatar/:specialistId', (req, res) => {
  const { specialistId } = req.params;
  const avatar = avatars[specialistId];
  if (avatar) res.json({ success: true, avatar: `/uploads/${avatar}` });
  else        res.json({ success: true, avatar: '/uploads/default-avatar.jpg' });
});

app.post('/upload-avatar', checkAdminLoggedIn, (req, res) => {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Unknown error' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { specialistId } = req.body || {};
    if (avatars[specialistId]) {
      const prev = path.join(uploadsDir, avatars[specialistId]);
      fs.unlink(prev, () => {}); // best-effort
    }
    avatars[specialistId] = req.file.filename;
    fs.writeFileSync(avatarsFilePath, JSON.stringify(avatars, null, 2));

    res.json({ success: true, avatarPath: `/uploads/${req.file.filename}` });
  });
});

/* ===================== SPECIALIST TEXT ===================== */
app.get('/specialist/:lang', (req, res) => {
  const filePath = translationFiles[req.params.lang];
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Language not found' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({
      success: true,
      data: {
        description: data.specialist1?.description || {},
        details:     data.specialist1?.details?.slice(0, 4) || [],
      },
    });
  } catch (e) {
    console.error('Read specialist JSON error:', e);
    res.status(500).json({ success: false, message: 'Read error' });
  }
});

app.post('/specialist/:lang', checkAdminLoggedIn, (req, res) => {
  const filePath = translationFiles[req.params.lang];
  const { description, details } = req.body || {};
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Language not found' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data.specialist1) data.specialist1 = {};
    const existingDetails = Array.isArray(data.specialist1.details) ? data.specialist1.details : [];
    const updatedDetails  = [...details];
    if (existingDetails.length > 4) updatedDetails.push(existingDetails[4]); // сохраняем 5-й блок (сертификаты)
    data.specialist1.description = description;
    data.specialist1.details     = updatedDetails;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (e) {
    console.error('Write specialist JSON error:', e);
    res.status(500).json({ success: false, message: 'Write error' });
  }
});

/* ===================== CONTENT ===================== */
app.get('/content', (req, res) => res.send(siteContent));
app.post('/update-content', checkAdminLoggedIn, (req, res) => {
  siteContent = req.body?.content;
  res.json({ success: true });
});

/* ===================== START ===================== */
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});
