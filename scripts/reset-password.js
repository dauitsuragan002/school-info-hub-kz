// .env файлында жаңа пароль орнату скрипті
// Іске қосу: node reset-password.js

import bcrypt from 'bcrypt';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Жаңа пароль: admin123
const NEW_PASSWORD = 'admin123';

async function resetPassword() {
  try {
    console.log(`Generating hash for new password: "${NEW_PASSWORD}"`);
    
    // Хэш жасау
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(NEW_PASSWORD, salt);
    
    console.log('New hash generated:', hash);
    
    // .env файлын оқу
    const envPath = path.resolve('.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // ADMIN_PASSWORD_HASH жолын ауыстыру
    const updatedContent = envContent.replace(
      /ADMIN_PASSWORD_HASH=.*/,
      `ADMIN_PASSWORD_HASH=${hash}`
    );
    
    // Файлды сақтау
    fs.writeFileSync(envPath, updatedContent);
    
    console.log('.env файлы сәтті жаңартылды');
    console.log('Енді сіз "admin123" паролімен жүйеге кіре аласыз');
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetPassword(); 