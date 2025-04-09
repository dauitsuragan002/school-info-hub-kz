// Windows curl жұмыс істемегендіктен, пароль тексеруді тестілеу скрипті
// Осы скриптті "node test-password.js" командасымен орындаңыз

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// .env файлын жүктеу
dotenv.config();

// Бірнеше пароль нұсқаларын тексеру
const passwords = [
  '111222', 
  'admin',
  'password',
  'qwerty123456',
  'Admin123',
  '123456',
  'admin123'
];

const hash = process.env.ADMIN_PASSWORD_HASH;
console.log('Hash from .env:', hash ? `${hash.substring(0, 10)}...` : 'Not found');

async function checkPasswords() {
  try {
    if (!hash) {
      console.error('ERROR: ADMIN_PASSWORD_HASH not found in .env file');
      return;
    }

    console.log('Testing multiple passwords...');
    for (const password of passwords) {
      const isMatch = await bcrypt.compare(password, hash);
      console.log(`Password "${password}": ${isMatch ? '✅ CORRECT' : '❌ incorrect'}`);
    }
  } catch (error) {
    console.error('Error comparing passwords:', error);
  }
}

checkPasswords(); 