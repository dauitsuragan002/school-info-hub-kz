import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Excel файлын оқу
const filePath = path.join(__dirname, '../public/сабақ кестесі IV тоқсан (1).xlsx');
console.log('Оқылатын файл:', filePath);

try {
  const workbook = XLSX.readFile(filePath);

  // Барлық парақтарды шығару
  console.log('Excel парақтары:');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`${index + 1}. ${sheetName}`);
  });

  // Бірінші парақты алу
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // JSON форматына айналдыру
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Бірінші жолдарды шығару (бағандар атаулары)
  console.log('\nБағандар атаулары:');
  if (jsonData.length > 0) {
    const headers = jsonData[0];
    headers.forEach((header, index) => {
      console.log(`${index + 1}. ${header || 'Бос баған'}`);
    });
  }

  // Деректердің алғашқы бірнеше жолдарын шығару
  console.log('\nДеректер мысалы (алғашқы 5 жол):');
  for (let i = 1; i < Math.min(6, jsonData.length); i++) {
    console.log(`Жол ${i}:`, jsonData[i]);
  }

} catch (error) {
  console.error('Файлды оқу кезінде қате орын алды:', error);
} 