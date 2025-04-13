import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'school_info_hub_kz_super_secret_key_123456';

export default async function handler(req, res) {
  // CORS заголовоктары қосу
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // OPTIONS сұранысына жауап
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Check-session API called');
  
  try {
    // Cookie-ден токенді алу
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;
    
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
    
    // Жарамсыз токен болса, оны жою
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    }));
    
    return res.status(200).json({ 
      message: 'Жарамсыз немесе мерзімі өткен сессия',
      isAuthenticated: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}; 