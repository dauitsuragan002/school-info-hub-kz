
import { Schedule, Student, Teacher } from "../models/types";

export const mockScheduleData: Schedule[] = [
  { day: "Дүйсенбі", time: "08:00-08:45", grade: "5", subject: "Математика", room: "203", shift: "1" },
  { day: "Дүйсенбі", time: "08:55-09:40", grade: "5", subject: "Қазақ тілі", room: "205", shift: "1" },
  { day: "Дүйсенбі", time: "09:50-10:35", grade: "5", subject: "Ағылшын тілі", room: "302", shift: "1" },
  { day: "Дүйсенбі", time: "08:00-08:45", grade: "6", subject: "Тарих", room: "104", shift: "1" },
  { day: "Дүйсенбі", time: "13:00-13:45", grade: "9", subject: "Физика", room: "307", shift: "2" },
  { day: "Сейсенбі", time: "08:00-08:45", grade: "5", subject: "Дене шынықтыру", room: "Спорт зал", shift: "1" },
  { day: "Сейсенбі", time: "13:00-13:45", grade: "10", subject: "Химия", room: "215", shift: "2" },
];

export const mockStudentsData: Student[] = [
  { name: "Амирова Айгүл", grade: "5А", birthdate: "2013-05-15" },
  { name: "Бекмуратов Арман", grade: "5А", birthdate: "2013-06-22" },
  { name: "Сагатова Динара", grade: "6Б", birthdate: "2012-04-10" },
  { name: "Каримов Алишер", grade: "9В", birthdate: "2009-07-18" },
  { name: "Нурланова Жанель", grade: "10А", birthdate: "2008-08-30" },
  { name: "Аскаров Еламан", grade: "11Б", birthdate: "2007-03-25" },
];

export const mockTeachersData: Teacher[] = [
  { name: "Жумабаева Сауле Каримовна", position: "Математика мұғалімі", birthdate: "1975-03-12" },
  { name: "Ахметов Нурлан Маратұлы", position: "Физика мұғалімі", birthdate: "1980-07-24" },
  { name: "Тулендиева Гульнара Сериковна", position: "Қазақ тілі мұғалімі", birthdate: "1972-09-05" },
  { name: "Исабаев Бауыржан Аскарович", position: "Дене шынықтыру мұғалімі", birthdate: "1983-11-18" },
  { name: "Алиева Назгуль Маратовна", position: "Ағылшын тілі мұғалімі", birthdate: "1978-02-27" },
];

// Calculate upcoming birthdays
export function getUpcomingBirthdays<T extends { birthdate: string; name: string }>(
  data: T[],
  count: number = 5
): T[] {
  const today = new Date();
  
  // Clone the data to avoid modifying the original
  const sortedData = [...data].map(item => {
    const birthdateObj = new Date(item.birthdate);
    const thisYearBirthdate = new Date(
      today.getFullYear(),
      birthdateObj.getMonth(),
      birthdateObj.getDate()
    );
    
    // If birthday already passed this year, set to next year
    if (thisYearBirthdate < today) {
      thisYearBirthdate.setFullYear(today.getFullYear() + 1);
    }
    
    // Return the original item plus the days until birthday
    return {
      ...item,
      daysUntil: Math.ceil((thisYearBirthdate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    };
  });
  
  // Sort by days until birthday
  sortedData.sort((a, b) => a.daysUntil - b.daysUntil);
  
  // Return the specified number of upcoming birthdays
  return sortedData.slice(0, count).map(({ daysUntil, ...rest }) => rest as T);
}
