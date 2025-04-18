import * as XLSX from 'xlsx';

export interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  grade: string;
  subject: string;
  room: string;
  shift: string;
  lessonNumber: number;
}

export interface StudentItem {
  id: number;
  name: string;
  grade: string;
  birthDate: string;
  school: string;
}

export interface TeacherItem {
  id: number;
  name: string;
  subject: string;
  birthDate: string;
  school: string;
}

// Файлдың деректерін жергілікті сақтау үшін
let cachedScheduleData: ScheduleItem[] | null = null;
let cachedStudentData: StudentItem[] | null = null;
let cachedTeacherData: TeacherItem[] | null = null;

// Файл метаданные үшін интерфейс
export interface ScheduleFile {
  id: string; // Генерацияланған бірегей ID
  name: string; // Файл атауы
  uploadDate: string; // Жүктелген күні
  type: 'schedule'; // Файл типі
  data: ScheduleItem[]; // Сабақ кестесі деректері
}

// Кэш ретінде деректер сақтау
let scheduleFiles: ScheduleFile[] = [];

// Локалды сақтау кілттері
const SCHEDULE_FILES_KEY = 'school_schedule_files';
const SCHEDULE_DATA_KEY = 'school_schedule_data';

// Ұяшық мәнін алу функциясы
function getCellValue(cell: any): string {
  if (!cell) return "";
  if (typeof cell === 'object') {
    if (cell.f && cell.v !== undefined) return String(cell.v).trim();
    if (cell.w) return String(cell.w).trim();
    if (cell.v) return String(cell.v).trim();
  }
  return String(cell).trim();
}

// Локалды сақтаудан файлдар тізімін оқу
function loadScheduleFiles(): ScheduleFile[] {
  try {
    const filesJson = localStorage.getItem(SCHEDULE_FILES_KEY);
    if (filesJson) {
      return JSON.parse(filesJson);
    }
  } catch (error) {
    console.error('Файлдар тізімін оқу кезінде қате:', error);
  }
  return [];
}

// Локалды сақтауға файлдар тізімін жазу
function saveScheduleFiles(files: ScheduleFile[]): void {
  try {
    localStorage.setItem(SCHEDULE_FILES_KEY, JSON.stringify(files));
  } catch (error) {
    console.error('Файлдар тізімін сақтау кезінде қате:', error);
  }
}

// Локалды сақтаудан белсенді файл деректерін оқу
function loadActiveScheduleData(): ScheduleItem[] {
  try {
    const dataJson = localStorage.getItem(SCHEDULE_DATA_KEY);
    if (dataJson) {
      return JSON.parse(dataJson);
    }
  } catch (error) {
    console.error('Деректерді оқу кезінде қате:', error);
  }
  return [];
}

// Локалды сақтауға белсенді файл деректерін жазу
function saveActiveScheduleData(data: ScheduleItem[]): void {
  try {
    localStorage.setItem(SCHEDULE_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Деректерді сақтау кезінде қате:', error);
  }
}

// Уақыт форматын тексеру және түзету
function normalizeTime(time: string): string {
  if (!time) return "";
  
  let normalized = String(time).trim();
  
  // Уақытты бөліктерге бөлу (мысалы: "14:00", "-", "14:45")
  const parts = normalized.split(/[-–—\s]+/); // Тире, ұзын тире, бос орын бойынша бөлу
  
  // Уақытты форматтау функциясы (HH:MM)
  const formatTimePart = (part: string): string | null => {
    part = part.trim().replace(/[.,]/g, ':'); // Нүктені, үтірді қос нүктеге ауыстыру
    const match = part.match(/^(\d{1,2}):?(\d{2})$/);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = match[2];
      return `${hour}:${minute}`;
    }
    // Егер тек сағат болса (мысалы, "14")
    const hourMatch = part.match(/^(\d{1,2})$/);
    if (hourMatch) {
        return `${hourMatch[1].padStart(2, '0')}:00`;
    }
    return null;
  };

  if (parts.length === 2) {
    const startTime = formatTimePart(parts[0]);
    const endTime = formatTimePart(parts[1]);
    if (startTime && endTime) {
      return `${startTime}-${endTime}`;
    }
  } else if (parts.length === 1) {
    // Егер тек бір бөлік болса (мысалы, "14:00")
    const startTime = formatTimePart(parts[0]);
    if (startTime) {
      // Әдепкі ұзақтықты (45 мин) қосуға тырысу
      const [hourStr, minuteStr] = startTime.split(':');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      
      let endMinute = minute + 45;
      let endHour = hour;
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute %= 60;
      }
      
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      return `${startTime}-${endTime}`;
    }
  }

  // console.warn(`Уақыт форматын анықтау мүмкін болмады: "${time}". Түпнұсқа мән қайтарылды.`);
  return normalized; // Белгісіз форматта түпнұсқаны қайтару
}

// Ауысымды анықтау функциясы - ТЕК парақ атауына негізделген
function determineShift(sheetName: string): string {
  const originalSheetName = sheetName.trim(); // Түпнұсқа атауды сақтау (лог үшін)
  const sheetNameLower = originalSheetName.toLowerCase();
  
  // console.log(`Ауысымды анықтау үшін парақ атауы: "${originalSheetName}" -> "${sheetNameLower}"`);

  // Нақты атаулар бойынша тексеру (кириллица)
  if (sheetNameLower === 'іі ауысым') {
    return "II";
  }
  if (sheetNameLower === 'і ауысым') {
    return "I";
  }

  // Қосымша жалпы тексерулер (басқа ықтимал атаулар үшін)
  // if (sheetNameLower.includes('ii') || 
  //     sheetNameLower.includes('2') || 
  //     sheetNameLower.includes('екінші') || 
  //     sheetNameLower.includes('второй') ||
  //     sheetNameLower.includes('ауысым 2') ||
  //     sheetNameLower.includes('2 ауысым')) {
  //   console.log(`Парақ атауында II ауысым белгісі табылды -> II ауысым`);
  //   return "II";
  // }
  
  // if (sheetNameLower.includes('ауысым 1') ||
  //     sheetNameLower.includes('1 ауысым') ||
  //     sheetNameLower.includes('бірінші') || 
  //     sheetNameLower.includes('первый') ||
  //     sheetNameLower.includes('1') ||
  //     sheetNameLower.includes('i')) { // "i" тексеруін соңына қою
  //    console.log(`Парақ атауында I ауысым белгісі табылды -> I ауысым`);
  //   return "I";
  // }

  // Әдепкі мән (егер ешқайсысы сәйкес келмесе)
  // console.warn(`Ауысымды парақ атауынан ("${originalSheetName}") анықтау мүмкін болмады. Әдепкі "I" ауысымы қолданылды.`);
  return "I";
}

// Сабақ нөмірін анықтау функциясы
function getLessonNumber(time: string, shift: string): number {
  const timeTable = {
    "I": [
      { start: "08:00", end: "08:45", num: 1 },
      { start: "08:50", end: "09:35", num: 2 },
      { start: "09:45", end: "10:30", num: 3 },
      { start: "10:40", end: "11:25", num: 4 },
      { start: "11:30", end: "12:15", num: 5 },
      { start: "12:20", end: "13:05", num: 6 },
      { start: "13:10", end: "13:55", num: 7 },
      { start: "14:00", end: "14:45", num: 8 } // I ауысымның 8-ші сабағы
    ],
    "II": [
      { start: "14:00", end: "14:45", num: 1 },
      { start: "14:50", end: "15:35", num: 2 },
      { start: "15:45", end: "16:30", num: 3 },
      { start: "16:40", end: "17:25", num: 4 },
      { start: "17:30", end: "18:15", num: 5 },
      { start: "18:20", end: "19:05", num: 6 },
      { start: "19:10", end: "19:55", num: 7 } // 7-ші сабақты қосу/комментарийін алу
    ]
  };

  const startTime = time.split('-')[0].trim();
  const schedule = timeTable[shift as keyof typeof timeTable];
  
  if (!schedule) {
      // console.warn(`getLessonNumber: Ауысым ("${shift}") үшін кесте табылмады.`);
      return 0; // Немесе басқа әдепкі мән
  }

  // Нақты сәйкестікті іздеу
  const exactMatch = schedule.find(period => period.start === startTime);
  if (exactMatch) {
    return exactMatch.num;
  }

  // Жақын уақытты табу (қажет болса, бірақ Excel-де уақыт дұрыс болса, бұл қажет емес)
  // console.warn(`getLessonNumber: Нақты уақыт ("${startTime}") табылмады, ауысым: "${shift}". Болжамдық нөмір қайтарылады.`);
  
  // Қарапайым болжау: сағатқа қарап
  const hour = parseInt(startTime.split(':')[0] || "0");
  if (shift === "I") {
      if (hour < 8) return 1;
      if (hour === 8) return startTime < "08:50" ? 1 : 2;
      if (hour === 9) return startTime < "09:45" ? 2 : 3;
      if (hour === 10) return startTime < "10:40" ? 3 : 4;
      if (hour === 11) return startTime < "11:30" ? 4 : 5;
      if (hour === 12) return startTime < "12:20" ? 5 : 6;
      if (hour === 13) return startTime < "13:10" ? 6 : 7;
      if (hour === 14) return 8;
  } else if (shift === "II") {
      // Handle potential errors if time is before 14:00 for shift II
      if (hour < 14) {
          // console.warn(`getLessonNumber: Shift is II but hour (${hour}) is before 14:00. Returning 1.`);
          return 1;
      }
      // Guess based on hour and approximate start times
      if (hour === 14) return startTime < "14:50" ? 1 : 2; // 14:00-14:49 -> 1, 14:50+ -> 2
      if (hour === 15) return startTime < "15:45" ? 2 : 3; // 15:00-15:44 -> 2, 15:45+ -> 3
      if (hour === 16) return startTime < "16:40" ? 3 : 4; // 16:00-16:39 -> 3, 16:40+ -> 4
      if (hour === 17) return startTime < "17:30" ? 4 : 5; // 17:00-17:29 -> 4, 17:30+ -> 5
      if (hour === 18) return startTime < "18:20" ? 5 : 6; // 18:00-18:19 -> 5, 18:20+ -> 6
      if (hour === 19) return startTime < "19:10" ? 6 : 7; // 19:00-19:09 -> 6, 19:10+ -> 7 (Assuming 7th lesson starts at 19:10)
      // If hour is > 19, it's likely beyond the schedule
      if (hour > 19) {
           // console.warn(`getLessonNumber: Hour (${hour}) is beyond typical schedule for shift II. Returning 7.`);
           return 7; // Last lesson number
      }
  }

  return 0; // Егер анықталмаса
}

// Мектеп сабақ кестесі xlsx файлын өңдеу (арнайы формат)
function processSchoolScheduleFile(workbook: XLSX.WorkBook): ScheduleItem[] {
  try {
    const scheduleItems: ScheduleItem[] = [];
    let itemId = 1;
    
    // console.log(`Excel файлында ${workbook.SheetNames.length} парақ бар:`, workbook.SheetNames);
    
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      }) as any[][];
      
      let currentDay = "";
      
      // Сыныптар жолын табу
      const classesRowIndex = findClassesRowIndex(data);
      if (classesRowIndex === -1) {
        // console.log(`${sheetName} парағында сыныптар жолы табылмады`);
        return;
      }
      
      // Сыныптарды алу
      const classes = extractClasses(data[classesRowIndex]);
      
      // Деректерді өңдеу
      for (let rowIndex = classesRowIndex + 1; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        
        // --- ЛОГТЫ ӨШІРУ ---
        // console.log(`Processing row ${rowIndex}:`, JSON.stringify(row)); 
        // --- ЛОГ СОҢЫ ---

        if (!row || row.length < 2) continue;
        
        // Күнді тексеру
        if (row[0] && isWeekDay(String(row[0]).trim())) {
          currentDay = String(row[0]).trim();
        }
        
        if (!currentDay) continue;
        
        // Уақытты алу және нормализациялау
        
        const rawTime = row[1] ? String(row[1]).trim() : ""; // Бастапқы мәнді алу
        // console.log('rawTime:',rawTime)
        if (!rawTime) {
            // console.log(`Жол ${rowIndex}: Уақыт ұяшығы бос немесе жарамсыз.`); // Өшірілді
            continue;
        }
        
        // console.log(`Жол ${rowIndex}: Бастапқы уақыт ұяшығы = "${rawTime}"`);
        let time = normalizeTime(rawTime);
        // console.log(`Жол ${rowIndex}: Нормаланған уақыт = "${time}"`);
        
        if (!time) { // Егер normalizeTime бос қайтарса
             // console.log(`Жол ${rowIndex}: Уақытты нормалау мүмкін болмады.`);
             continue;
        }

        // 8:00 сабағын тексеру және логқа жазу
        // if (time.startsWith("08:00")) { // Шартты өзгерттік: тек 08:00-ден басталуын тексеру
        //   console.log(`!!! 8:00 сабағы табылды (Нормаланған уақыт: ${time})`);
        // }

        // Әр сынып үшін
        for (const classInfo of classes) {
          const columnIndex = classInfo.columnIndex;
          const grade = classInfo.grade;
          
          if (columnIndex === undefined || columnIndex >= row.length) continue;
          
          // Пәнді алу
          const subjectCellValue = row[columnIndex];
          let subject = getCellValue(subjectCellValue);
          if (!subject || subject.toLowerCase() === "каб") continue;
          
          // Кабинетті алу
          let room = "";
          if (columnIndex + 1 < row.length) {
            room = getCellValue(row[columnIndex + 1]);
          }

          // --- Бұрынғы 8:00 логын осында жылжытайық --- 
          // if (time.startsWith("08:00")) {
          //   console.log(`1-сабақ (${time}): Сынып - ${grade}, Пән - ${subject}, Кабинет - ${room}`);
          // }
          // --- Жылжытылған лог соңы --- 

          // Сабақ нөмірін анықтау (scheduleService ішінде)
          const lessonNumber = getLessonNumber(time, determineShift(sheetName));
          
          // Сабақты қосу
          scheduleItems.push({
            id: itemId++,
            day: currentDay,
            time: time,
            grade: grade,
            subject: subject,
            room: room || "-",
            shift: determineShift(sheetName),
            lessonNumber: lessonNumber // Дұрыс нөмірді қою
          });
        }
      }
    });
    
    // console.log(`Барлығы ${scheduleItems.length} сабақ табылды`);
    
    // Кэштеу
    cachedScheduleData = scheduleItems;
    
    return scheduleItems;
  } catch (error) {
    console.error('Сабақ кестесін өңдеу кезінде қате:', error);
    throw error;
  }
}

// Апта күні екенін тексеру
function isWeekDay(text: string): boolean {
  const lowerText = text.toLowerCase();
  return (
    lowerText === 'дүйсенбі' || lowerText === 'понедельник' || lowerText === 'monday' ||
    lowerText === 'сейсенбі' || lowerText === 'вторник' || lowerText === 'tuesday' ||
    lowerText === 'сәрсенбі' || lowerText === 'среда' || lowerText === 'wednesday' ||
    lowerText === 'бейсенбі' || lowerText === 'четверг' || lowerText === 'thursday' ||
    lowerText === 'жұма' || lowerText === 'пятница' || lowerText === 'friday' ||
    lowerText === 'сенбі' || lowerText === 'суббота' || lowerText === 'saturday' ||
    // Қысқартылған күн атаулары
    lowerText === 'дс' || lowerText === 'пн' || lowerText === 'mon' ||
    lowerText === 'сс' || lowerText === 'вт' || lowerText === 'tue' ||
    lowerText === 'ср' || lowerText === 'wed' ||
    lowerText === 'бс' || lowerText === 'чт' || lowerText === 'thu' ||
    lowerText === 'жм' || lowerText === 'пт' || lowerText === 'fri' ||
    lowerText === 'сб' || lowerText === 'sat'
  );
}

// Сыныптар жолын табу
function findClassesRowIndex(data: any[][]): number {
  // Лог қосу
  // console.log(`Сыныптар жолын іздеу басталды. Барлығы ${data.length} жол бар.`);
  
  // Әр жолды тексеру
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    // Егер бұл жолда сыныптар болса
    let classCount = 0;
    let detectedClasses = [];
    
    for (let j = 0; j < row.length; j++) {
      if (!row[j]) continue;
      
      let cellStr = "";
      if (typeof row[j] === 'object' && row[j].w) {
        cellStr = String(row[j].w).trim();
      } else {
        cellStr = String(row[j]).trim();
      }
      
      // Лог қосу
      if (cellStr && cellStr.length > 0) {
        // console.log(`Жол ${i}, баған ${j}: "${cellStr}"`);
      }
      
      // Сынып атауының форматына сәйкес келе ме - кеңейтілген форматтар
      if (cellStr.match(/\d+[\s"]*[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ"]+/u) || // 5А, 5 А
          cellStr.match(/\d+\s*«[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]»/u) ||    // 5 «А»
          cellStr.match(/\d+\s*"[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]"/u) ||     // 5 "А"
          cellStr.match(/\d+\s*класс\s*[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]/ui) || // 5 класс А, 5класс Б
          cellStr.match(/\d+\s*сынып\s*[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]/ui) || // 5 сынып А, 5сынып Б
          cellStr.match(/^[0-9]+[А-Яа-яӘІҢҒҮҰҚӨҺәіңғүұқөһ]$/u)) {      // 5А (тек сан+әріп)
        
        // Кабинет емес екенін тексеру
        if (!cellStr.toLowerCase().includes('каб')) {
          classCount++;
          detectedClasses.push(cellStr);
        }
      }
    }
    
    // Егер жолда 2-ден артық сынып табылса, бұл сыныптар жолы
    if (classCount >= 2) {
      // console.log(`Сыныптар жолы табылды: ${i} индексінде. Сыныптар: ${detectedClasses.join(', ')}`);
      return i;
    }
  }
  
  // console.log('Сыныптар жолы табылмады!');
  return -1; // Табылмаса -1 қайтару
}

// Сыныптарды алу
function extractClasses(row: any[]): { columnIndex: number; grade: string }[] {
  const classes: { columnIndex: number; grade: string }[] = [];
  
  // console.log(`Сыныптарды іздеу: жолда ${row.length} баған бар`);
  
  for (let i = 0; i < row.length; i++) {
    const cell = row[i];
    if (!cell) continue;
    
    let cellStr = "";
    
    // Excel ұяшығының типтері бойынша түрлендіру
    if (typeof cell === 'object' && cell.w) {
      // Егер бұл форматталған Excel ұяшығы болса
      cellStr = String(cell.w).trim();
    } else {
      cellStr = String(cell).trim();
    }
    
    // console.log(`Сыныптарды іздеу: Баған ${i}: "${cellStr}"`);
    
    // Сынып атауын іздеу (мысалы: "7 А", "8 Б", т.б.)
    // Кеңейтілген регулярлық өрнекті қолданамыз
    if (cellStr.match(/\d+[\s"]*[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ"]+/u) ||
        cellStr.match(/^[0-9]+[А-Яа-яӘІҢҒҮҰҚӨҺәіңғүұқөһ]{1,2}$/u) ||
        cellStr.match(/^[0-9]+ *[А-Яа-яӘІҢҒҮҰҚӨҺәіңғүұқөһ]{1,2}$/u) ||
        cellStr.match(/\d+\s*«[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]»/u) ||
        cellStr.match(/\d+\s*"[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]"/u) ||
        cellStr.match(/\d+\s*класс\s*[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]/ui) ||
        cellStr.match(/\d+\s*сынып\s*[а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]/ui)) {
      
      // "каб" сөзі жоқ екенін тексеру (кабинет емес)
      if (!cellStr.toLowerCase().includes('каб')) {
        // Сынып атауын стандартты форматқа келтіру
        let grade = cellStr.replace(/"/g, '').trim();
        
        // Арнайы форматтарды өңдеу
        grade = grade.replace(/«|»/g, ''); // «А» -> А
        grade = grade.replace(/класс/gi, ''); // 5 класс А -> 5 А
        grade = grade.replace(/сынып/gi, ''); // 5 сынып А -> 5 А
        
        // Сынып атауларын келісті формаға келтіру (5А, 5Б, т.б.)
        grade = grade.replace(/\s+/g, ''); // Барлық бос орындарды алып тастау
        
        // console.log(`Сынып табылды: "${grade}" (${i} бағанда)`);
        
        classes.push({
          columnIndex: i,
          grade: grade
        });
      }
    }
  }
  
  // console.log(`Барлығы ${classes.length} сынып табылды`);
  return classes;
}

// Сыныптың қай топқа жататынын анықтау
export function getClassGroup(grade: string): string {
  const upperGrade = grade.toUpperCase();
  
  // Лицей сыныптары: 5Ғ, 6Ғ, 7Ғ, 8Ғ
  if (upperGrade.match(/^[5-8]Ғ$/)) {
    return "Лицей сыныптары";
  }
  
  // Орыс сыныптары: 5В, 6В, 7В, 8В, 9В
  if (upperGrade.match(/^[5-9]В$/)) {
    return "Орыс сыныптары";
  }
  
  // Сынып нөірі бойынша топтау (мысалы: "5-сыныптар", "6-сыныптар")
  const classNumber = upperGrade.match(/^\d+/);
  if (classNumber) {
    return `${classNumber[0]}-сыныптар`;
  }
  
  return "Басқа сыныптар";
}

// Сабақ кестесін сақталған деректерден оқу
export async function readScheduleFromExcel(): Promise<ScheduleItem[]> {
  if (cachedScheduleData) {
    return cachedScheduleData;
  }
  
  // Локалды сақтаудан оқу
  const data = loadActiveScheduleData();
  if (data.length > 0) {
    cachedScheduleData = data;
    return data;
  }
  
  return [];
}

// Жаңа Excel файлын оқу
export async function readExcelFile(file: File): Promise<ScheduleItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // console.log(`"${file.name}" файлы оқылуда, көлемі: ${file.size} байт, типі: ${file.type}`);
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Файл деректерін консольге шығару (алғашқы 100 байт)
        let firstBytesLog = '';
        for (let i = 0; i < Math.min(100, data.length); i++) {
          firstBytesLog += data[i].toString(16).padStart(2, '0') + ' ';
        }
        // console.log(`Файл деректері (алғашқы 100 байт): ${firstBytesLog}`);
        
        // Excel параметрлерін кеңейту
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true,
          cellStyles: true,
          cellText: true,
          cellNF: true,
          cellHTML: false,
          dense: true,
          dateNF: 'yyyy-mm-dd',
          WTF: true, // кеңейтілген қате журналы
          sheetStubs: true
        });
        
        // console.log(`Excel файлы оқылды, барлық парақтар: ${workbook.SheetNames.join(', ')}`);
        
        // Парақтарды қайта тексеру - егер 2 ауысым деп аталатын парақ болса, оны басымдықпен өңдеу
        let customSheetName = null;
        for(const sheetName of workbook.SheetNames) {
          // II-ауысым немесе 2 ауысым деп аталатын парақты іздеу
          if(sheetName.toLowerCase().includes('ii') || 
             sheetName.toLowerCase().includes('2') || 
             sheetName.includes('екінші') || 
             /смена.*2/.test(sheetName.toLowerCase()) ||
             /ауысым.*2/.test(sheetName.toLowerCase())) {
            customSheetName = sheetName;
            // console.log(`Екінші ауысым парағы табылды: "${customSheetName}"`);
            break;
          }
        }
        
        // Егер арнайы парақ табылса, тек осы парақты өңдеу
        if(customSheetName) {
          // console.log(`Тек "${customSheetName}" парағы өңделеді`);
          
          // Арнайы парақтан деректерді алу
          const worksheet = workbook.Sheets[customSheetName];
          
          // Парақ туралы мәліметтер
          // console.log(`Парақ ақпараты: !ref=${worksheet['!ref']}`);
          
          // Деректерді массивке айналдыру
          const data = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: '',
            blankrows: false,
            rawNumbers: false
          }) as any[][];
          
          // console.log(`"${customSheetName}" парағында ${data.length} жол бар`);
          
          // Бірнеше жолдарды лог етіп, деректер құрылымын тексеру
          for (let i = 0; i < Math.min(10, data.length); i++) {
            // console.log(`Жол ${i}:`, JSON.stringify(data[i]));
          }
          
          // Сыныптар жолын іздеу
          const classesRowIndex = findClassesRowIndex(data);
          
          if (classesRowIndex === -1) {
            // console.log(`"${customSheetName}" парағында сыныптар жолы табылмады`);
            reject(new Error(`"${customSheetName}" парағында сыныптар жолы табылмады`));
            return;
          }
          
          // Сыныптарды алу
          const classes = extractClasses(data[classesRowIndex]);
          // console.log(`"${customSheetName}" парағында табылған сыныптар:`, classes.map(c => c.grade).join(", "));
          
          if (classes.length === 0) {
            // console.log(`"${customSheetName}" парағында сыныптар табылмады`);
            reject(new Error(`"${customSheetName}" парағында сыныптар табылмады`));
            return;
          }
          
          // Деректерді қолмен өңдеу
          const scheduleItems: ScheduleItem[] = [];
          let itemId = 1;
          let currentDay = "";
          
          // Сабақ кестесін өңдеу
          for (let rowIndex = classesRowIndex + 1; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            
            // Жол бос болса, өткізіп жіберу
            if (!row || row.length < 2) {
              continue;
            }
            
            // Күн бағанын тексеру (бірінші баған)
            if (row[0] && row[0] !== "" && row[0] !== null) {
              let possibleDay = "";
              
              // Excel ұяшығының типтері бойынша түрлендіру
              if (typeof row[0] === 'object' && row[0].w) {
                possibleDay = String(row[0].w).trim();
              } else {
                possibleDay = String(row[0]).trim();
              }
              
              // Егер бұл күн болса (апта күндерінің бірі)
              if (isWeekDay(possibleDay)) {
                currentDay = possibleDay;
                // console.log(`Күн анықталды: ${currentDay}`);
                continue; // Бұл жолда тек күн атауы, сабақ жоқ
              }
            }
            
            // Егер күн белгіленбеген болса жолды өткізіп жіберу
            if (!currentDay) {
              continue;
            }
            
            // Уақыт бағанын тексеру (екінші баған)
            let time = "";
            if (row[1]) {
              // Excel ұяшығының типтері бойынша түрлендіру
              if (typeof row[1] === 'object' && row[1].w) {
                time = String(row[1].w).trim();
              } else {
                time = String(row[1]).trim();
              }
            }
            
            // Уақыт форматын тексеру және түзету
            if (time && !time.includes(':') && !time.includes('-')) {
              // Егер бұл тек сан болса (мысалы, "8"), оны сағат форматына айналдыру
              if (!isNaN(Number(time))) {
                time = `${time}:00-${Number(time)+1}:00`;
              }
            }
            
            if (!time || time === "") {
              continue; // Уақыт жоқ болса, өткізіп жіберу
            }
            
            // Сыныптар бойынша жүру
            for (const classInfo of classes) {
              const columnIndex = classInfo.columnIndex;
              const grade = classInfo.grade;
              
              // Баған индексі бар екенін тексеру
              if (columnIndex === undefined || columnIndex >= row.length) {
                continue;
              }
              
              // Пән ұяшығының мәнін алу
              let subject = "";
              if (row[columnIndex]) {
                if (typeof row[columnIndex] === 'object' && row[columnIndex].w) {
                  subject = String(row[columnIndex].w).trim();
                } else {
                  subject = String(row[columnIndex]).trim();
                }
              }
              
              // Кабинет ұяшығының мәнін алу (келесі баған)
              let room = "";
              if (columnIndex + 1 < row.length && row[columnIndex + 1]) {
                if (typeof row[columnIndex + 1] === 'object' && row[columnIndex + 1].w) {
                  room = String(row[columnIndex + 1].w).trim();
                } else {
                  room = String(row[columnIndex + 1]).trim();
                }
              }

              // console.log(`1-сабақ (${time}): Сынып - ${grade}, Пән - ${subject}, Кабинет - ${room}`);
              
              // Егер пән бос болса немесе "каб" болса (бұл кабинет бағаны), өткізіп жіберу
              if (!subject || subject === "" || subject.toLowerCase() === "каб") {
                continue;
              }
              
              // Сабақ жазбасын қосу
              scheduleItems.push({
                id: itemId++,
                day: currentDay,
                time: time,
                grade: grade,
                subject: subject,
                room: room,
                shift: "II", // Бұл екінші ауысым парағы
                lessonNumber: 0
              });
            }
          }
          
          // console.log(`"${customSheetName}" парағынан ${scheduleItems.length} сабақ табылды (II ауысым)`);
          
          if (scheduleItems.length === 0) {
            reject(new Error(`"${customSheetName}" парағында сабақтар табылмады`));
            return;
          }
          
          // Нәтижелерді сақтау
          cachedScheduleData = scheduleItems;
          
          // Файлды сақтау
          const fileId = generateId();
          const newFile: ScheduleFile = {
            id: fileId,
            name: file.name,
            uploadDate: new Date().toISOString(),
            type: 'schedule',
            data: scheduleItems
          };
          
          // Файлдар тізімін жаңарту
          scheduleFiles = [...loadScheduleFiles(), newFile];
          saveScheduleFiles(scheduleFiles);
          
          // Белсенді деректерді жаңарту
          saveActiveScheduleData(scheduleItems);
          
          resolve(scheduleItems);
          return;
        }
        
        // Егер арнайы парақ табылмаса, әдеттегідей өңдеу
        // Сабақ кестесі файлы болуы мүмкін
        const scheduleItems = processSchoolScheduleFile(workbook);
        
        // Егер дұрыс формат болса
        if (scheduleItems && scheduleItems.length > 0) {
          // Файлды сақтау
          const fileId = generateId();
          const newFile: ScheduleFile = {
            id: fileId,
            name: file.name,
            uploadDate: new Date().toISOString(),
            type: 'schedule',
            data: scheduleItems
          };
          
          // Файлдар тізімін жаңарту
          scheduleFiles = [...loadScheduleFiles(), newFile];
          saveScheduleFiles(scheduleFiles);
          
          // Белсенді деректерді жаңарту
          cachedScheduleData = scheduleItems;
          saveActiveScheduleData(scheduleItems);
          
          resolve(scheduleItems);
        } else {
          reject(new Error('Сабақ кестесі табылмады немесе дұрыс формат емес'));
        }
      } catch (error) {
        console.error('Excel файлын оқу кезінде қате:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Файлды оқу кезінде қате орын алды'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Барлық сақталған файлдар тізімін алу
export function getScheduleFiles(): ScheduleFile[] {
  if (scheduleFiles.length === 0) {
    scheduleFiles = loadScheduleFiles();
  }
  return scheduleFiles;
}

// Белгілі бір файлды белсенді ету
export function activateScheduleFile(fileId: string): ScheduleItem[] {
  const files = loadScheduleFiles();
  const file = files.find(f => f.id === fileId);
  
  if (file) {
    cachedScheduleData = file.data;
    saveActiveScheduleData(file.data);
    return file.data;
  }
  
  return [];
}

// Белгілі бір файлды жою
export function deleteScheduleFile(fileId: string): boolean {
  let files = loadScheduleFiles();
  const initialLength = files.length;
  
  files = files.filter(f => f.id !== fileId);
  
  if (files.length < initialLength) {
    saveScheduleFiles(files);
    scheduleFiles = files;
    
    // Егер белсенді файл жойылған болса, деректерді тазарту
    const data = loadActiveScheduleData();
    const activeFileExists = files.some(f => JSON.stringify(f.data) === JSON.stringify(data));
    
    if (!activeFileExists && data.length > 0) {
      cachedScheduleData = [];
      saveActiveScheduleData([]);
    }
    
    return true;
  }
  
  return false;
}

// Бірегей ID генерациялау
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Студенттер мен мұғалімдердің туған күндерін Excel файлынан оқу
export async function readBirthdaysFromExcel(file: File, type: 'students' | 'teachers'): Promise<StudentItem[] | TeacherItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // console.log(`"${file.name}" файлы оқылуда, көлемі: ${file.size} байт, типі: ${file.type}`);
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd'
        });
        
        if (workbook.SheetNames.length === 0) {
          reject(new Error('Excel файлында парақтар табылмады'));
          return;
        }
        
        // Бірінші парақты алу
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          reject(new Error('Деректер табылмады'));
          return;
        }
        
        // console.log(`Excel файлынан ${jsonData.length} жазба оқылды`);
        
        // Деректерді өңдеу
        if (type === 'students') {
          const students: StudentItem[] = [];
          let itemId = 1;
          
          jsonData.forEach((row: any) => {
            // Оқушы аты-жөні, сыныбы және туған күні
            const name = row.name || row.Name || row.ФИО || row['Аты-жөні'] || '';
            const grade = row.grade || row.Grade || row.Class || row['Сынып'] || '';
            let birthDate = row.birthDate || row.BirthDate || row['Туған күні'] || row.birthdate || '';
            
            // Excel күн форматын түрлендіру
            if (birthDate instanceof Date) {
              birthDate = birthDate.toISOString().split('T')[0];
            }
            
            if (name && grade && birthDate) {
              students.push({
                id: itemId++,
                name,
                grade,
                birthDate: String(birthDate),
                school: 'Негізгі мектеп'
              });
            }
          });
          
          if (students.length === 0) {
            reject(new Error('Файлдан оқушылар туралы деректер табылмады'));
            return;
          }
          
          // Оқушылар деректерін сақтау
          cachedStudentData = students;
          resolve(students);
          
        } else if (type === 'teachers') {
          const teachers: TeacherItem[] = [];
          let itemId = 1;
          
          jsonData.forEach((row: any) => {
            // Мұғалім аты-жөні, пәні және туған күні
            const name = row.name || row.Name || row.ФИО || row['Аты-жөні'] || '';
            const subject = row.subject || row.Subject || row['Пән'] || '';
            let birthDate = row.birthDate || row.BirthDate || row['Туған күні'] || row.birthdate || '';
            
            // Excel күн форматын түрлендіру
            if (birthDate instanceof Date) {
              birthDate = birthDate.toISOString().split('T')[0];
            }
            
            if (name && subject && birthDate) {
              teachers.push({
                id: itemId++,
                name,
                subject,
                birthDate: String(birthDate),
                school: 'Негізгі мектеп'
              });
            }
          });
          
          if (teachers.length === 0) {
            reject(new Error('Файлдан мұғалімдер туралы деректер табылмады'));
            return;
          }
          
          // Мұғалімдер деректерін сақтау
          cachedTeacherData = teachers;
          resolve(teachers);
        }
        
      } catch (error) {
        console.error('Excel файлын оқу кезінде қате:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Файлды оқу кезінде қате орын алды'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Кэштелген студенттер мен мұғалімдер деректерін алу
export function getStudents(): StudentItem[] {
  return cachedStudentData || [];
}

export function getTeachers(): TeacherItem[] {
  return cachedTeacherData || [];
} 