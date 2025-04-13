import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Сақтау орнын және файл атауын конфигурациялау
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Сақтау каталогы
    const uploadDir = path.join(process.cwd(), 'public/data/schedules');
    
    // Каталог бар-жоғын тексеру
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Каталог жасалды: ${uploadDir}`);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Оригинал файл атауын сақтау немесе бірегей атау генерациялау
    // Кириллица символдарын сақтау үшін decodeURIComponent қолданамыз
    const originalName = decodeURIComponent(file.originalname);
    
    // Бос орындарды төменгі сызықшаға ауыстыру
    const fileName = originalName.replace(/\s+/g, '_');
    
    cb(null, fileName);
  }
});

// Тек Excel файлдарын қабылдау
const fileFilter = (req, file, cb) => {
  // Файл аты мен MIME типін логқа шығару
  console.log(`Жүктелген файл: ${file.originalname}, MIME type: ${file.mimetype}`);
  
  // MIME типін тексеру
  const validMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',  // Кейбір браузерлер Excel файлдарына осындай MIME типін береді
    'application/zip'            // .xlsx файлдары негізінде ZIP архивтері
  ];
  
  // Кеңейтімін тексеру
  const ext = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.xls', '.xlsx'];
  
  console.log(`Файл кеңейтімі: ${ext}`);
  
  if (validExtensions.includes(ext) || validMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  
  cb(new Error('Тек Excel файлдары (.xlsx, .xls) қабылданады'));
};

// Multer конфигурациясы
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB шектеу
});

// Аутентификация middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Аутентификация қажет' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_info_hub_kz_super_secret_key_123456');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Жарамсыз токен' });
  }
};

// Файл жүктеу endpoint
router.post('/upload', authenticateJWT, (req, res) => {
  upload.single('file')(req, res, function(err) {
    if (err) {
      console.error('Файл жүктеу қатесі:', err.message);
      return res.status(400).json({ 
        message: err.message || 'Файл жүктеу кезінде қате орын алды' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Файл табылмады' });
    }

    console.log(`Файл сәтті жүктелді: ${req.file.filename}`);
    
    // Жүктелген файл туралы ақпарат қайтару
    return res.status(200).json({
      message: 'Сабақ кестесі сәтті жүктелді',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: `/data/schedules/${req.file.filename}`,
        size: req.file.size,
        uploadDate: new Date().toISOString()
      }
    });
  });
});

// Файлдар тізімін алу endpoint
router.get('/files', authenticateJWT, (req, res) => {
  try {
    const dirPath = path.join(process.cwd(), 'public/data/schedules');
    
    if (!fs.existsSync(dirPath)) {
      return res.status(200).json({ files: [] });
    }
    
    const files = fs.readdirSync(dirPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.xlsx' || ext === '.xls';
      })
      .map(file => {
        const stats = fs.statSync(path.join(dirPath, file));
        return {
          filename: file,
          path: `/data/schedules/${file}`,
          size: stats.size,
          uploadDate: stats.mtime
        };
      });
    
    return res.status(200).json({ files });
  } catch (error) {
    console.error('Файлдар тізімін алу кезінде қате:', error);
    return res.status(500).json({ 
      message: 'Файлдар тізімін алу кезінде қате орын алды', 
      error: error.message 
    });
  }
});

// Файлды жою endpoint
router.delete('/files/:filename', authenticateJWT, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'public/data/schedules', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Файл табылмады' });
    }
    
    fs.unlinkSync(filePath);
    console.log(`Файл жойылды: ${filename}`);
    
    return res.status(200).json({ 
      message: 'Файл сәтті жойылды',
      filename
    });
  } catch (error) {
    console.error('Файлды жою кезінде қате:', error);
    return res.status(500).json({ 
      message: 'Файлды жою кезінде қате орын алды', 
      error: error.message 
    });
  }
});

export default router; 