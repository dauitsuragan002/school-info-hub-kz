
import { Schedule, Student, Teacher } from '@/models/types';

export const mockScheduleData: Schedule[] = [
  { day: 'Дүйсенбі', time: '09:00 - 09:45', grade: '1', subject: 'Математика', room: '101', shift: '1' },
  { day: 'Дүйсенбі', time: '10:00 - 10:45', grade: '1', subject: 'Қазақ тілі', room: '102', shift: '1' },
  { day: 'Дүйсенбі', time: '11:00 - 11:45', grade: '2', subject: 'Жаратылыстану', room: '201', shift: '1' },
  { day: 'Дүйсенбі', time: '12:00 - 12:45', grade: '2', subject: 'Ағылшын тілі', room: '202', shift: '1' },
  { day: 'Сейсенбі', time: '09:00 - 09:45', grade: '3', subject: 'Информатика', room: '301', shift: '1' },
  { day: 'Сейсенбі', time: '10:00 - 10:45', grade: '3', subject: 'Музыка', room: '302', shift: '1' },
  { day: 'Сейсенбі', time: '11:00 - 11:45', grade: '4', subject: 'Дене шынықтыру', room: 'Спортзал', shift: '1' },
  { day: 'Сейсенбі', time: '12:00 - 12:45', grade: '4', subject: 'Өнер', room: '402', shift: '1' },
  { day: 'Сәрсенбі', time: '09:00 - 09:45', grade: '1', subject: 'Математика', room: '101', shift: '2' },
  { day: 'Сәрсенбі', time: '10:00 - 10:45', grade: '1', subject: 'Қазақ тілі', room: '102', shift: '2' },
  { day: 'Сәрсенбі', time: '11:00 - 11:45', grade: '2', subject: 'Жаратылыстану', room: '201', shift: '2' },
  { day: 'Сәрсенбі', time: '12:00 - 12:45', grade: '2', subject: 'Ағылшын тілі', room: '202', shift: '2' },
  { day: 'Бейсенбі', time: '09:00 - 09:45', grade: '3', subject: 'Информатика', room: '301', shift: '2' },
  { day: 'Бейсенбі', time: '10:00 - 10:45', grade: '3', subject: 'Музыка', room: '302', shift: '2' },
  { day: 'Бейсенбі', time: '11:00 - 11:45', grade: '4', subject: 'Дене шынықтыру', room: 'Спортзал', shift: '2' },
  { day: 'Бейсенбі', time: '12:00 - 12:45', grade: '4', subject: 'Өнер', room: '402', shift: '2' },
];

export const mockStudentsData: Student[] = [
  { name: 'Айдын', grade: '1', birthdate: '2015-05-10' },
  { name: 'Болат', grade: '2', birthdate: '2014-08-22' },
  { name: 'Жанар', grade: '3', birthdate: '2013-03-15' },
  { name: 'Дамир', grade: '4', birthdate: '2012-11-01' },
  { name: 'Айша', grade: '1', birthdate: '2015-07-18' },
  { name: 'Ернар', grade: '2', birthdate: '2014-09-25' },
  { name: 'Камила', grade: '3', birthdate: '2013-04-05' },
  { name: 'Мадияр', grade: '4', birthdate: '2012-12-20' },
];

export const mockTeachersData: Teacher[] = [
  { name: 'Айгүл', position: 'Математика мұғалімі', birthdate: '1980-06-20' },
  { name: 'Серік', position: 'Қазақ тілі мұғалімі', birthdate: '1975-02-14' },
  { name: 'Гүлмира', position: 'Ағылшын тілі мұғалімі', birthdate: '1985-10-08' },
  { name: 'Бақытжан', position: 'Информатика мұғалімі', birthdate: '1978-04-30' },
];

// Function to get upcoming birthdays for students or teachers
export function getUpcomingBirthdays<T extends { birthdate: string; name: string }>(
  people: T[], 
  limit: number = 5
): T[] {
  // Get current date
  const today = new Date();
  
  // Calculate days until birthday for each person
  const peopleWithDays = people.map(person => {
    const birthdate = new Date(person.birthdate);
    const birthdateThisYear = new Date(
      today.getFullYear(),
      birthdate.getMonth(),
      birthdate.getDate()
    );
    
    // If birthday has already occurred this year, calculate for next year
    if (birthdateThisYear < today) {
      birthdateThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil(
      (birthdateThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return { ...person, daysUntil };
  });
  
  // Sort by closest upcoming birthday
  peopleWithDays.sort((a, b) => a.daysUntil - b.daysUntil);
  
  // Return the first 'limit' entries and remove the daysUntil property
  return peopleWithDays
    .slice(0, limit)
    .map(({ daysUntil, ...person }) => person as unknown as T);
}
