import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// .env файлын жүктеу
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'school_info_hub_kz_super_secret_key_123456';
// Admin password hash - .env файлынан алу
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// Мәндерді логке шығару
console.log('Environment variables loaded:');
console.log('JWT_SECRET:', JWT_SECRET ? (JWT_SECRET === 'school_info_hub_kz_super_secret_key_123456' ? 'using default' : 'custom (set)') : 'not set');
console.log('ADMIN_PASSWORD_HASH:', ADMIN_PASSWORD_HASH ? 'set (length: ' + ADMIN_PASSWORD_HASH.length + ')' : 'not set');

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes

// Check Session API
app.get('/api/check-session', (req, res) => {
  console.log('Check-session API called');
  
  // Cookie-ден JWT токенін алу
  const token = req.cookies.auth_token;
  
  console.log('Session check - cookie headers:', req.headers.cookie ? 'Present' : 'None');
  console.log('Session check - token exists:', token ? 'Yes' : 'No');

  if (!token) {
    console.log('Auth check failed: No token');
    return res.status(200).json({ 
      message: 'Аутентификация жоқ',
      isAuthenticated: false,
      timestamp: new Date().toISOString()
    });
  }

  try {
    // JWT токенін тексеру
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Invalid token payload');
    }
    
    console.log('Auth check passed: Valid token');
    
    return res.status(200).json({ 
      message: 'Сессия жарамды',
      isAuthenticated: true,
      user: decoded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('Auth check failed: Invalid token', error);
    
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
    });
    
    return res.status(200).json({ 
      message: 'Жарамсыз немесе мерзімі өткен сессия',
      isAuthenticated: false,
      timestamp: new Date().toISOString() 
    });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  console.log('Login API called');
  
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Пароль көрсетілмеген' });
  }

  console.log('Login attempt with password:', password ? 'Yes (length: ' + password.length + ')' : 'None');
  console.log('ADMIN_PASSWORD_HASH available:', ADMIN_PASSWORD_HASH ? 'Yes (length: ' + ADMIN_PASSWORD_HASH.length + ')' : 'No');

  try {
    // Келген парольді сақталған хэшпен салыстыру
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Пароль қате' });
    }
    
    // Пароль дұрыс болса, JWT жасау
    const token = jwt.sign(
      { isAdmin: true },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // JWT-ді HttpOnly cookie ретінде орнату
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1000, // 1 day
      path: '/',
    });

    // Сәтті жауап
    return res.status(200).json({ message: 'Сәтті кіру' });

  } catch (error) {
    console.error('Логин кезінде қате:', error);
    return res.status(500).json({ message: 'Серверде ішкі қате' });
  }
});

// Logout API
app.post('/api/logout', (req, res) => {
  console.log('Logout request received');
  
  // Cookie-ді жою
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
  });
  
  console.log('Auth cookie cleared');
  
  return res.status(200).json({ 
    message: 'Жүйеден шығу сәтті орындалды',
    success: true,
    timestamp: new Date().toISOString()
  });
});

// Generate Password API
app.post('/api/generate-password', async (req, res) => {
  console.log('Generate password API called');
  
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Пароль көрсетілмеген' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Password hash generated:', hash ? 'Yes' : 'No');
    
    return res.status(200).json({ hash });
  } catch (error) {
    console.error('Хэшті генерациялау кезінде қате:', error);
    return res.status(500).json({ message: 'Серверде қате орын алды' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT_SECRET: ${JWT_SECRET ? (JWT_SECRET === 'school_info_hub_kz_super_secret_key_123456' ? 'using default' : 'custom (set)') : 'not set'}`);
  console.log(`ADMIN_PASSWORD_HASH: ${ADMIN_PASSWORD_HASH ? 'set' : 'not set'}`);
}); 