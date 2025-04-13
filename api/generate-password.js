import bcrypt from 'bcrypt';

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
  
  // Тек POST сұраныстары үшін
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Тек POST сұраныстары қабылданады' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Пароль көрсетілмеген' });
  }

  try {
    // Қауіпсіз хэш жасау
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Password hash generated successfully');
    
    // Хэш-ті қайтару
    return res.status(200).json({ 
      hash,
      message: 'Пароль хэшы сәтті жасалды'
    });
  } catch (error) {
    console.error('Хэшті генерациялау кезінде қате:', error);
    return res.status(500).json({ 
      message: 'Серверде қате орын алды',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}; 