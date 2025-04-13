import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// --- ҚАУІПСІЗДІК: Бұл мәндерді Environment Variables арқылы алу керек! ---
// Vercel жобаңыздың Settings -> Environment Variables бөлімінде орнатыңыз
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''; // Әзірге бос
const JWT_SECRET = process.env.JWT_SECRET || 'school_info_hub_kz_super_secret_key_123456'; // .env файлындағы мәнді пайдалану
const JWT_EXPIRATION = '1d'; // Токеннің жарамдылық мерзімі (мысалы, 1 күн)
// -----------------------------------------------------------------------

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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Тек POST сұраныстары қабылданады' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Пароль көрсетілмеген' });
  }

  // Дебаг жазбалары
  console.log('Login attempt with password:', password ? 'Yes (length: ' + password.length + ')' : 'None');
  console.log('ADMIN_PASSWORD_HASH available:', ADMIN_PASSWORD_HASH ? 'Yes (length: ' + ADMIN_PASSWORD_HASH.length + ')' : 'No');

  if (!ADMIN_PASSWORD_HASH) {
    console.error('ADMIN_PASSWORD_HASH environment variable орнатылмаған!');
    return res.status(500).json({ message: 'Серверде қате конфигурация' });
  }

  if (!JWT_SECRET || JWT_SECRET === 'your-very-strong-jwt-secret') {
    console.error('JWT_SECRET environment variable орнатылмаған немесе әдепкі мәнде!');
    // Өндірістік ортада мұны қате ретінде өңдеген жөн
    // return res.status(500).json({ message: 'Серверде қате конфигурация (JWT)' });
  }

  try {
    // Келген парольді сақталған хэшпен салыстыру
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Пароль қате' });
    }

    // Пароль дұрыс болса, JWT жасау
    const token = jwt.sign(
      { isAdmin: true }, // Токен ішіндегі деректер (payload)
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION } // Жарамдылық мерзімі
    );

    // JWT-ді HttpOnly cookie ретінде орнату
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
      httpOnly: true, // JavaScript арқылы қол жетімді емес
      secure: process.env.NODE_ENV !== 'development', // Тек HTTPS арқылы жіберу (өндірісте)
      sameSite: 'strict', // CSRF шабуылдарынан қорғау
      maxAge: 60 * 60 * 24, // Cookie жарамдылық мерзімі (секундта, мысалы 1 күн)
      path: '/', // Cookie қол жетімді жол
    }));

    // Сәтті жауап
    return res.status(200).json({ message: 'Сәтті кіру' });

  } catch (error) {
    console.error('Логин кезінде қате:', error);
    return res.status(500).json({ message: 'Серверде ішкі қате' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}; 