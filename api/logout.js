import cookie from 'cookie';

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
  
  // Тек POST сұраныстарын өңдеу
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: 'Тек POST сұраныстары қабылданады',
      method: req.method
    });
  }
  
  try {
    console.log('Logout request received');
    
    // Қазіргі куки алу
    const cookies = cookie.parse(req.headers.cookie || '');
    console.log('Current cookies:', Object.keys(cookies));
    
    // Cookie-ді жою
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax', // 'strict' орнына 'lax' пайдалану
      maxAge: 0, // Жарамдылық мерзімін 0-ге қою
      path: '/',
    }));
    
    console.log('Auth cookie cleared');
    
    return res.status(200).json({ 
      message: 'Жүйеден шығу сәтті орындалды',
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    return res.status(500).json({ 
      message: 'Жүйеден шығу кезінде қате орын алды',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}; 