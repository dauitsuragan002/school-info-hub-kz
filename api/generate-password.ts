import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';

// Хэш генерациялау үшін тұз раундтарының саны
const SALT_ROUNDS = 10;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS заголовоктары қосу
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // OPTIONS сұранысына жауап
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Тек POST сұраныстары қабылданады' });
  }
  
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Пароль көрсетілмеген' });
    }
    
    // Парольді хэштеу
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Хэштелген парольді қайтару
    return res.status(200).json({ 
      message: 'Пароль сәтті хэштелді',
      hashedPassword
    });
  } catch (error) {
    console.error('Пароль хэштеу кезінде қате:', error);
    return res.status(500).json({ message: 'Серверде ішкі қате' });
  }
} 