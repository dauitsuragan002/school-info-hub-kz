import React, { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScheduleItem, getClassGroup } from "@/services/scheduleService";
import { Button } from "@/components/ui/button";

interface ScheduleTableProps {
  scheduleData: ScheduleItem[];
  shiftFilter?: string; // Ауысым сүзгісі (қосымша)
  dayFilter?: string; // Күн фильтрі (қосымша)
  gradeFilter?: string; // Сынып фильтрі (қосымша)
}

export const ScheduleTable = ({ scheduleData, shiftFilter = "all", dayFilter = "all", gradeFilter = "all" }: ScheduleTableProps) => {
  console.log("ScheduleTable компоненті басталды, фильтрлер:", { shiftFilter, dayFilter, dataLength: scheduleData.length });

  // Ауысымдарды тексеру
  useEffect(() => {
    console.log("Деректердегі ауысымдар:", [...new Set(scheduleData.map(item => item.shift))]);
    
    // II ауысым сабақтарының уақыттарын тексеру
    const shift2Lessons = scheduleData.filter(item => item.shift === "II");
    if (shift2Lessons.length > 0) {
      const times = [...new Set(shift2Lessons.map(item => item.time))].sort();
      console.log("II ауысым сабақтарының уақыттары:", times);
      
      const firstLessonTime = times[0]?.split('-')[0]?.trim();
      console.log("II ауысымның бірінші сабағының уақыты:", firstLessonTime);
    }
  }, [scheduleData]);

  // Дұрыс ауысым деректерін таңдау (әрқашан ауысымға байланысты қатаң сүзгі)
  const filteredByShift = useMemo(() => {
    // Артық сүзуді болдырмау, деректер тікелей сүзілген түрде келеді
    console.log("Сүзілген деректер саны:", scheduleData.length);
    return scheduleData;
  }, [scheduleData]);
  
  if (filteredByShift.length === 0) {
    return (
      <Card className="p-6 text-center text-amber-600">
        <p>Таңдалған сүзгілер бойынша деректер табылмады</p>
        <p className="text-sm text-muted-foreground mt-2">
          Басқа ауысым, сынып немесе күнді таңдап көріңіз
        </p>
      </Card>
    );
  }
  
  // Деректерді түрлі жолдармен топтастыру - енді filteredByShift пайдаланамыз
  const organizedData = useMemo(() => {
    // Күндер бойынша реттеу
    const weekDayOrder = {
      'дүйсенбі': 1, 'сейсенбі': 2, 'сәрсенбі': 3, 'бейсенбі': 4, 'жұма': 5, 'сенбі': 6,
      'понедельник': 1, 'вторник': 2, 'среда': 3, 'четверг': 4, 'пятница': 5, 'суббота': 6
    };
    
    const dayTranslations: Record<string, string> = {
      'понедельник': 'дүйсенбі',
      'вторник': 'сейсенбі',
      'среда': 'сәрсенбі',
      'четверг': 'бейсенбі',
      'пятница': 'жұма',
      'суббота': 'сенбі'
    };
    
    // Деректерді сұрыптау
    const sortedData = [...filteredByShift].sort((a, b) => {
      // Күн бойынша
      const dayOrderA = weekDayOrder[a.day.toLowerCase()] || 100;
      const dayOrderB = weekDayOrder[b.day.toLowerCase()] || 100;
      if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB;
      
      // Сынып бойынша
      const gradeNumA = parseInt(a.grade.match(/\d+/)?.[0] || "0");
      const gradeNumB = parseInt(b.grade.match(/\d+/)?.[0] || "0");
      if (gradeNumA !== gradeNumB) return gradeNumA - gradeNumB;
      
      // Сыныптың әрпі бойынша
      const gradeLetterA = a.grade.replace(/\d+/g, '').trim();
      const gradeLetterB = b.grade.replace(/\d+/g, '').trim();
      if (gradeLetterA !== gradeLetterB) return gradeLetterA.localeCompare(gradeLetterB);
      
      // Уақыт бойынша
      const timeA = a.time.split('-')[0].trim();
      const timeB = b.time.split('-')[0].trim();
      if (timeA && timeB) {
        // Нақты сабақ нөмірлерін салыстыру (getLessonNumber функциясын пайдаланбай)
        if (timeA === "8:00" || timeA === "08:00") return -1; // 8:00 әрқашан бірінші
        if (timeB === "8:00" || timeB === "08:00") return 1;
        
        if (timeA === "8:50" || timeA === "08:50") {
          if (timeB === "8:00" || timeB === "08:00") return 1;
          return -1; // 8:50 әрқашан екінші орында (8:00-ден кейін)
        }
        if (timeB === "8:50" || timeB === "08:50") {
          if (timeA === "8:00" || timeA === "08:00") return -1;
          return 1;
        }
        
        const hourA = parseInt(timeA.split(':')[0] || "0");
        const hourB = parseInt(timeB.split(':')[0] || "0");
        if (hourA !== hourB) return hourA - hourB;
        
        const minuteA = parseInt(timeA.split(':')[1] || "0");
        const minuteB = parseInt(timeB.split(':')[1] || "0");
        return minuteA - minuteB;
      }
      
      return 0;
    });
    
    // Күн аттарын қазақшаға аудару
    const normalizedData = sortedData.map(item => ({
      ...item,
      day: dayTranslations[item.day.toLowerCase()] || item.day
    }));
    
    // Сыныптарды топтарға бөлу
    const gradeGroups: Record<string, string[]> = {};
    normalizedData.forEach(item => {
      const group = getClassGroup(item.grade);
      if (!gradeGroups[group]) {
        gradeGroups[group] = [];
      }
      if (!gradeGroups[group].includes(item.grade)) {
        gradeGroups[group].push(item.grade);
      }
    });
    
    // Арнайы сыныптардың тізімін жасау
    const specialGrades: string[] = [];
    
    // Лицей сыныптарын сақтау
    if (gradeGroups["Лицей сыныптары"]) {
      specialGrades.push(...gradeGroups["Лицей сыныптары"]);
    }
    
    // Орыс сыныптарын сақтау (қажет болса)
    if (gradeGroups["Орыс сыныптары"]) {
      specialGrades.push(...gradeGroups["Орыс сыныптары"]);
    }
    
    // Жалпы топтардан арнайы сыныптарды алып тастау
    Object.keys(gradeGroups).forEach(group => {
      if (group.match(/^\d+-сыныптар$/)) {
        // "5-сыныптар", "6-сыныптар" т.б. топтардан арнайы сыныптарды алып тастау
        gradeGroups[group] = gradeGroups[group].filter(grade => !specialGrades.includes(grade));
      }
    });
    
    // Топтар бойынша сұрыптау
    Object.keys(gradeGroups).forEach(group => {
      gradeGroups[group].sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      });
    });
    
    // Күн -> Сынып -> Уақыт бойынша топтастыру
    function groupByDayAndGrade(data: ScheduleItem[]) {
      const result: Record<string, Record<string, ScheduleItem[]>> = {};
      
      // Күндерді алу
      for (const item of data) {
        if (!result[item.day]) {
          result[item.day] = {};
        }
        
        // Сыныптарды алу
        if (!result[item.day][item.grade]) {
          result[item.day][item.grade] = [];
        }
        
        // Сабақтарды уақыт бойынша қосу
        result[item.day][item.grade].push(item);
      }
      
      return result;
    }
    
    // Сынып -> Күн -> Уақыт бойынша топтастыру
    function groupByGradeAndDay(data: ScheduleItem[]) {
      const result: Record<string, Record<string, ScheduleItem[]>> = {};
      
      // Сыныптарды алу
      for (const item of data) {
        if (!result[item.grade]) {
          result[item.grade] = {};
        }
        
        // Күндерді алу
        if (!result[item.grade][item.day]) {
          result[item.grade][item.day] = [];
        }
        
        // Сабақтарды уақыт бойынша қосу
        result[item.grade][item.day].push(item);
      }
      
      return result;
    }
    
    // Топтастыру нұсқалары
    return {
      // Күн -> Сынып -> Уақыт (Excel классикалық көрініс)
      byDayAndGrade: groupByDayAndGrade(normalizedData),
      // Сынып -> Күн -> Уақыт (Бір сыныптың кестесі)
      byGradeAndDay: groupByGradeAndDay(normalizedData),
      // Бірегей күндер
      uniqueDays: [...new Set(normalizedData.map(item => item.day))].sort((a, b) => {
        return (weekDayOrder[a.toLowerCase()] || 100) - (weekDayOrder[b.toLowerCase()] || 100);
      }),
      // Бірегей сыныптар
      uniqueGrades: [...new Set(normalizedData.map(item => item.grade))].sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      }),
      // Бірегей сынып нөмірлері (5, 6, 7, т.б.)
      uniqueGradeNumbers: [...new Set(normalizedData.map(item => {
        const match = item.grade.match(/\d+/);
        return match ? match[0] : "";
      }))].filter(Boolean).sort((a, b) => parseInt(a) - parseInt(b)),
      // Бірегей ауысымдар
      uniqueShifts: [...new Set(normalizedData.map(item => item.shift))].sort(),
      // Сыныптарды топтар бойынша
      gradeGroups: gradeGroups
    };
  }, [filteredByShift]);
  
  // Егер деректер жоқ болса
  if (filteredByShift.length === 0) {
    return (
      <div className="text-center p-4">
        <p>Көрсетілетін мәліметтер жоқ</p>
      </div>
    );
  }
  
  console.log("ScheduleTable компоненті: деректер саны", filteredByShift.length);
  console.log("Бірегей күндер:", [...new Set(filteredByShift.map(item => item.day))]);

  // Сабақ нөмірін алу функциясы
  const getLessonNumber = (time: string, shift: string = "I"): number => {
    const timeStart = time.split('-')[0].trim();
    const hour = parseInt(timeStart.split(':')[0] || "0");
    const minute = parseInt(timeStart.split(':')[1] || "0");
    
    // Егер нақты 8:00-8:45 болса, 1-ші сабақ
    if ((timeStart === "8:00" || timeStart === "08:00") || 
       (time === "8:00-8:45" || time === "08:00-08:45")) {
      console.log("Бірінші сабақ анықталды:", time);
      return 1;
    }
    
    // Егер нақты 8:50-9:35 болса, 2-ші сабақ
    if ((timeStart === "8:50" || timeStart === "08:50") || 
       (time === "8:50-9:35" || time === "08:50-09:35")) {
      console.log("Екінші сабақ анықталды:", time);
      return 2;
    }
    
    // II ауысым үшін (14:00-ден басталады)
    if (hour >= 14) {
      // II ауысым үшін арнайы уақыт кестесі
      if (hour === 14 && minute >= 0 && minute <= 45) return 1;  // 14:00-14:45 - 1-ші сабақ
      if ((hour === 14 && minute >= 50) || (hour === 15 && minute <= 35)) return 2;  // 14:50-15:35 - 2-ші сабақ
      if ((hour === 15 && minute >= 45) || (hour === 16 && minute <= 30)) return 3;  // 15:45-16:30 - 3-ші сабақ
      if ((hour === 16 && minute >= 40) || (hour === 17 && minute <= 25)) return 4;  // 16:40-17:25 - 4-ші сабақ
      if ((hour === 17 && minute >= 30) || (hour === 18 && minute <= 15)) return 5;  // 17:30-18:15 - 5-ші сабақ
      if ((hour === 18 && minute >= 20) || (hour === 19 && minute <= 5)) return 6;   // 18:20-19:05 - 6-шы сабақ
      if ((hour === 19 && minute >= 10) || (hour === 19 && minute <= 55)) return 7;  // 19:10-19:55 - 7-ші сабақ
    }
    
    // Нақты сабақ уақыттары
    const exactTimings = [
      { start: { hour: 8, minute: 0 }, end: { hour: 8, minute: 45 }, num: 1 },
      { start: { hour: 8, minute: 50 }, end: { hour: 9, minute: 35 }, num: 2 },
      { start: { hour: 9, minute: 45 }, end: { hour: 10, minute: 30 }, num: 3 },
      { start: { hour: 10, minute: 40 }, end: { hour: 11, minute: 25 }, num: 4 },
      { start: { hour: 11, minute: 30 }, end: { hour: 12, minute: 15 }, num: 5 },
      { start: { hour: 12, minute: 20 }, end: { hour: 13, minute: 5 }, num: 6 },
      { start: { hour: 13, minute: 10 }, end: { hour: 13, minute: 55 }, num: 7 },
      { start: { hour: 14, minute: 0 }, end: { hour: 14, minute: 45 }, num: 1 }, // II ауысым 1-ші сабақ
      { start: { hour: 14, minute: 50 }, end: { hour: 15, minute: 35 }, num: 2 }, // II ауысым 2-ші сабақ
      { start: { hour: 15, minute: 45 }, end: { hour: 16, minute: 30 }, num: 3 }, // II ауысым 3-ші сабақ
      { start: { hour: 16, minute: 40 }, end: { hour: 17, minute: 25 }, num: 4 }, // II ауысым 4-ші сабақ
      { start: { hour: 17, minute: 30 }, end: { hour: 18, minute: 15 }, num: 5 }, // II ауысым 5-ші сабақ
      { start: { hour: 18, minute: 20 }, end: { hour: 19, minute: 5 }, num: 6 },  // II ауысым 6-шы сабақ 
      { start: { hour: 19, minute: 10 }, end: { hour: 19, minute: 55 }, num: 7 }  // II ауысым 7-ші сабақ
    ];
    
    // Жіберілген уақытты нақты уақыттармен салыстыру
    for (const timing of exactTimings) {
      // Нақты сәйкестік
      if (hour === timing.start.hour && minute === timing.start.minute) {
        return timing.num;
      }
      
      // Уақыт аралығында болса да сабақ нөмірін қайтару
      const timeInRange = 
        (hour > timing.start.hour || (hour === timing.start.hour && minute >= timing.start.minute)) && 
        (hour < timing.end.hour || (hour === timing.end.hour && minute <= timing.end.minute));
      
      if (timeInRange) {
        return timing.num;
      }
    }
    
    // Бірінші ауысым нақты уақыттар бойынша
    if (shift === "I") {
      if (hour === 8 && minute >= 0 && minute <= 45) return 1;   // 8:00-8:45 - 1-ші сабақ
      if ((hour === 8 && minute >= 50) || (hour === 9 && minute <= 35)) return 2;   // 8:50-9:35 - 2-ші сабақ
      if ((hour === 9 && minute >= 45) || (hour === 10 && minute <= 30)) return 3;  // 9:45-10:30 - 3-ші сабақ
      if ((hour === 10 && minute >= 40) || (hour === 11 && minute <= 25)) return 4; // 10:40-11:25 - 4-ші сабақ
      if ((hour === 11 && minute >= 30) || (hour === 12 && minute <= 15)) return 5; // 11:30-12:15 - 5-ші сабақ
      if ((hour === 12 && minute >= 20) || (hour === 13 && minute <= 5)) return 6;  // 12:20-13:05 - 6-шы сабақ
      if ((hour === 13 && minute >= 10) || (hour === 13 && minute <= 55)) return 7; // 13:10-13:55 - 7-ші сабақ
      if ((hour === 14 && minute >= 0) || (hour === 14 && minute <= 45)) return 8;  // 14:00-14:45 - 8-ші сабақ
    }
    
    // Екінші ауысым нақты уақыттар бойынша
    if (shift === "II") {
      if (hour === 8 && minute >= 0 && minute <= 45) return 1;   // 8:00-8:45 - 1-ші сабақ
      if ((hour === 8 && minute >= 50) || (hour === 9 && minute <= 35)) return 2;   // 8:50-9:35 - 2-ші сабақ
      if ((hour === 9 && minute >= 45) || (hour === 10 && minute <= 30)) return 3;  // 9:45-10:30 - 3-ші сабақ
      if ((hour === 10 && minute >= 40) || (hour === 11 && minute <= 25)) return 4; // 10:40-11:25 - 4-ші сабақ
      if ((hour === 11 && minute >= 30) || (hour === 12 && minute <= 15)) return 5; // 11:30-12:15 - 5-ші сабақ
      if ((hour === 12 && minute >= 20) || (hour === 13 && minute <= 5)) return 6;  // 12:20-13:05 - 6-шы сабақ
      if ((hour === 13 && minute >= 10) || (hour === 13 && minute <= 55)) return 7; // 13:10-13:55 - 7-ші сабақ
      if ((hour === 14 && minute >= 0) || (hour === 14 && minute <= 45)) return 8;  // 14:00-14:45 - 8-ші сабақ
    }
    
    // Таңның немесе түстің басына қарап, болжамдық сабақ нөмірін беру
    if (hour === 8 && minute === 0) {
      return 1; // Егер нақты 8:00 болса, міндетті түрде 1-ші сабақ
    }
    
    // Жалпы болжау (уақыт бойынша)
    if (hour < 9) {
      return 1; // 9-дан кіші сағат (8:xx) үшін бірінші сабақ
    } else if (hour === 9 && minute < 40) {
      return 2; // 9:40-қа дейін екінші сабақ
    } else if (hour === 9 || (hour === 10 && minute < 35)) {
      return 3; // 10:35-ке дейін үшінші сабақ
    } else if (hour === 10 || (hour === 11 && minute < 25)) {
      return 4; // 11:25-ке дейін төртінші сабақ
    } else if (hour === 11 || (hour === 12 && minute < 20)) {
      return 5; // 12:20-ға дейін бесінші сабақ
    } else if (hour === 12 || (hour === 13 && minute < 10)) {
      return 6; // 13:10-ға дейін алтыншы сабақ
    } else if (hour === 13) {
      return 7; // 13:xx үшін жетінші сабақ
    } else {
      return 8; // 14:xx және одан кейін сегізінші сабақ
    }
  };
  
  // Егер тек бір сынып таңдалған болса (толық кесте көрсету)
  const isOneGradeSelected = organizedData.uniqueGrades.length === 1;
  
  if (isOneGradeSelected) {
    const grade = organizedData.uniqueGrades[0];
    const gradeData = organizedData.byGradeAndDay[grade];
    
    console.log("Бір сынып таңдалды:", grade);
    console.log("Сыныптың күндері:", Object.keys(gradeData || {}));
    
    return (
      <div className="text-sm">
        <h2 className="text-xl font-bold mb-4 bg-muted/50 p-2 rounded">{grade} сыныбының кестесі</h2>
        
        {organizedData.uniqueShifts.map(shift => {
          // Тек осы ауысымдағы сабақтарды алу
          const shiftsLessons = filteredByShift.filter(item => item.shift === shift && item.grade === grade);
          
          if (shiftsLessons.length === 0) return null;
          
          return (
            <div key={shift} className="mb-8">
              <h3 className="text-lg font-semibold mb-2 bg-muted/30 p-2 rounded">{shift} ауысым</h3>
              <div className="overflow-x-auto">
                <Table className="border-collapse border border-gray-300">
                  <TableCaption>
                    {grade} сыныбы, {shift} ауысым
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[150px] border border-gray-300">Күн</TableHead>
                      <TableHead className="w-[50px] border border-gray-300 text-center">№</TableHead>
                      <TableHead className="w-[100px] border border-gray-300">Уақыт</TableHead>
                      <TableHead className="border border-gray-300">Пән</TableHead>
                      <TableHead className="border border-gray-300 text-center">Кабинет</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizedData.uniqueDays.map(day => {
                      if (!gradeData[day]) return null;
                      
                      const dayLessons = gradeData[day].filter(item => item.shift === shift);
                      if (dayLessons.length === 0) return null;
                      
                      return (
                        <React.Fragment key={day}>
                          <TableRow className="bg-muted/50">
                            <TableCell className="font-medium border border-gray-300" colSpan={5}>{day}</TableCell>
                          </TableRow>
                          {dayLessons.map((item, index) => (
                            <TableRow key={`${day}_${index}`} className="hover:bg-muted/20">
                              <TableCell className="border border-gray-300"></TableCell>
                              <TableCell className="text-center font-bold border border-gray-300">{getLessonNumber(item.time, item.shift)}</TableCell>
                              <TableCell className="border border-gray-300">{item.time}</TableCell>
                              <TableCell className="font-medium border border-gray-300">{item.subject}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.room}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Күндерді сұрыптау
  const filteredDays = dayFilter !== "all" 
    ? [dayFilter.toLowerCase()]
    : [...new Set(filteredByShift.map(item => item.day.toLowerCase()))].sort((a, b) => {
        const weekDayOrder = {
          'дүйсенбі': 1, 'сейсенбі': 2, 'сәрсенбі': 3, 'бейсенбі': 4, 'жұма': 5, 'сенбі': 6,
          'понедельник': 1, 'вторник': 2, 'среда': 3, 'четверг': 4, 'пятница': 5, 'суббота': 6
        };
        return (weekDayOrder[a] || 100) - (weekDayOrder[b] || 100);
      });
  
  // Күн таңдалғанын тексеру
  const isDaySelected = dayFilter !== "all" && organizedData.uniqueDays.some(d => d.toLowerCase() === dayFilter.toLowerCase());
  
  console.log("Күн таңдалды:", isDaySelected, {
    uniqueDays: organizedData.uniqueDays,
    dayFilter
  });
                       
  const isGradeNumberSelected = filteredByShift.length > 0 && filteredByShift.every(item => {
    // Сынып нөмірін тексеру
    const match = item.grade.match(/\d+/);
    return match && organizedData.uniqueGradeNumbers.length === 1;
  });
  
  if (isDaySelected) {
    // Таңдалған күнді анықтау
    const day = dayFilter !== 'all' 
      ? organizedData.uniqueDays.find(d => d.toLowerCase() === dayFilter.toLowerCase()) || organizedData.uniqueDays[0]
      : organizedData.uniqueDays[0];
    
    // Күн атауын әдемілеу
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
    
    // Ауысым таңдау
    const shiftsToShow = shiftFilter !== "all" 
      ? [shiftFilter] 
      : organizedData.uniqueShifts;
    
    console.log("Көрсетілетін ауысымдар:", shiftsToShow);
    
    return (
      <div className="by-day-view">
        {filteredDays.map(day => {
          // Күн атауын әдемілеу
          const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
          
          // Ауысым таңдау
          const shiftsToShow = shiftFilter !== "all" 
            ? [shiftFilter] 
            : organizedData.uniqueShifts;
          
          console.log("Көрсетілетін ауысымдар:", shiftsToShow);
          
          return (
            <div key={day} className="text-sm">
              {/* Таңдалған фильтрлерді бейдж арқылы көрсету */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-bold">{formattedDay}</h2>
                <div className="flex flex-wrap items-center gap-1 ml-2">
                  {shiftsToShow.map(shift => (
                    <span key={shift} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {shift} ауысым
                    </span>
                  ))}
                  {gradeFilter !== "all" && !gradeFilter.startsWith("grade_") && !gradeFilter.startsWith("group_") && (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                      {gradeFilter}
                    </span>
                  )}
                  {gradeFilter.startsWith("grade_") && (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                      {gradeFilter.substring(6)}-сынып
                    </span>
                  )}
                  {gradeFilter.startsWith("group_") && (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                      {gradeFilter.substring(6)}
                    </span>
                  )}
                </div>
              </div>
              
              {shiftsToShow.map(shift => {
                // Тек осы ауысымдағы сабақтар
                const lessonsInShift = filteredByShift.filter(item => 
                  item.shift === shift && 
                  item.day.toLowerCase() === day.toLowerCase()
                );
                
                if (lessonsInShift.length === 0) {
                  console.log(`${shift} ауысымында сабақтар жоқ`);
                  return null;
                }
                
                console.log(`${shift} ауысымында ${lessonsInShift.length} сабақ бар`);
                
                return (
                  <div key={shift} className="mb-6">
                    {/* Ауысым тақырыбын көрсетпейміз, ол бейдж формасында жоғарыда көрсетілді */}
                    
                    {/* Сынып топтары бойынша көрсету */}
                    {Object.keys(organizedData.gradeGroups).map(groupName => {
                      const gradesInGroup = organizedData.gradeGroups[groupName];
                      // Осы топтағы сыныптар үшін сабақтар
                      const lessonsForGroup = lessonsInShift.filter(item => gradesInGroup.includes(item.grade));
                      
                      if (lessonsForGroup.length === 0) return null;
                      
                      return (
                        <div key={groupName} className="mb-4">
                          {/* Топ тақырыбын тек ол таңдалмаған кезде көрсетеміз */}
                          {(gradeFilter !== `group_${groupName}` && !gradesInGroup.includes(gradeFilter)) && (
                            <h4 className="text-base font-semibold mb-2 bg-muted/30 p-2 rounded">{groupName}</h4>
                          )}
                          
                          {/* Кесте */}
                          <Card className="mb-4">
                            {/* Карточканың тақырыбын жоямыз, бәрібір сабақ кестесі екені белгілі */}
                            <CardContent className="py-3">
                              {groupName === "Орыс сыныптары" || groupName === "Лицей сыныптары" ? (
                                <div className="overflow-x-auto">
                                  {/* Орыс және Лицей сыныптары үшін арнайы көрініс - бәрі бір кестеде */}
                                  <Table className="border-collapse border border-gray-300">
                                    <TableHeader>
                                      <TableRow className="bg-muted/30">
                                        <TableHead rowSpan={2} className="w-[30px] border border-gray-300 text-center">№</TableHead>
                                        <TableHead rowSpan={2} className="w-[80px] border border-gray-300">Уақыт</TableHead>
                                        {gradesInGroup.sort((a, b) => {
                                          // Сынып нөмірі бойынша сұрыптау
                                          const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                                          const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                                          if (numA !== numB) return numA - numB;
                                          return a.localeCompare(b);
                                        }).map(grade => (
                                          <TableHead 
                                            key={grade}
                                            colSpan={2}
                                            className="w-[160px] hover:bg-accent hover:text-accent-foreground transition-colors border border-gray-300 text-center"
                                            onClick={() => window.location.href = `?grade=${grade}&day=${day}`}
                                            style={{ cursor: 'pointer' }}
                                          >
                                            <Button variant="ghost" size="sm" className="p-0 m-0 h-auto font-normal">
                                              {grade}
                                            </Button>
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                      <TableRow className="bg-muted/30">
                                        {gradesInGroup.sort((a, b) => {
                                          // Сынып нөмірі бойынша сұрыптау
                                          const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                                          const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                                          if (numA !== numB) return numA - numB;
                                          return a.localeCompare(b);
                                        }).map(grade => (
                                          <React.Fragment key={`head_${grade}`}>
                                            <TableHead className="border border-gray-300">Пән</TableHead>
                                            <TableHead className="w-[60px] border border-gray-300 text-center">Каб.</TableHead>
                                          </React.Fragment>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {/* Барлық уақыт мәндерін табу */}
                                      {[...new Set(lessonsForGroup.map(item => item.time))]
                                        .sort((a, b) => {
                                          const timeA = a.split('-')[0].trim();
                                          const timeB = b.split('-')[0].trim();
                                          
                                          // Нақты уақыттарды бірінші орындарға қою
                                          if (timeA === "8:00" || timeA === "08:00") return -1; 
                                          if (timeB === "8:00" || timeB === "08:00") return 1;
                                          
                                          if (timeA === "8:50" || timeA === "08:50") {
                                            if (timeB === "8:00" || timeB === "08:00") return 1;
                                            return -1;
                                          }
                                          if (timeB === "8:50" || timeB === "08:50") {
                                            if (timeA === "8:00" || timeA === "08:00") return -1;
                                            return 1;
                                          }
                                          
                                          const hourA = parseInt(timeA.split(':')[0] || "0");
                                          const hourB = parseInt(timeB.split(':')[0] || "0");
                                          if (hourA !== hourB) return hourA - hourB;
                                          
                                          const minuteA = parseInt(timeA.split(':')[1] || "0");
                                          const minuteB = parseInt(timeB.split(':')[1] || "0");
                                          return minuteA - minuteB;
                                        })
                                        .map(time => (
                                          <TableRow key={time} className="hover:bg-muted/20">
                                            <TableCell className="text-center font-bold border border-gray-300">{getLessonNumber(time, shift)}</TableCell>
                                            <TableCell className="text-xs border border-gray-300">{time}</TableCell>
                                            {gradesInGroup.sort((a, b) => {
                                              // Сынып нөмірі бойынша сұрыптау
                                              const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                                              const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                                              if (numA !== numB) return numA - numB;
                                              return a.localeCompare(b);
                                            }).map(grade => {
                                              const lesson = lessonsForGroup.find(
                                                item => item.time === time && item.grade === grade
                                              );
                                              
                                              return (
                                                <React.Fragment key={`${grade}_${time}`}>
                                                  <TableCell className={`text-xs border border-gray-300 ${lesson ? 'font-medium' : 'text-muted-foreground'}`}>
                                                    {lesson?.subject || "-"}
                                                  </TableCell>
                                                  <TableCell className="text-xs text-center border border-gray-300">{lesson?.room || "-"}</TableCell>
                                                </React.Fragment>
                                              );
                                            })}
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                /* Басқа топтар үшін бұрынғы көрініс */
                                <>
                                  {organizedData.uniqueGradeNumbers
                                    .filter(gradeNum => {
                                      // Тек осы топтағы сынып нөмірлерін алу
                                      return gradesInGroup.some(grade => grade.startsWith(gradeNum));
                                    })
                                    .map(gradeNum => {
                                      // Осы нөмірлі барлық сыныптар (тек осы топтан)
                                      const gradesWithNum = gradesInGroup.filter(g => g.startsWith(gradeNum));
                                      
                                      // Осы сыныптар үшін сабақтар
                                      const lessonsForGradeNum = lessonsForGroup.filter(item => gradesWithNum.includes(item.grade));
                                      
                                      if (lessonsForGradeNum.length === 0) return null;
                                      
                                      // Барлық уақыт мәндерін табу
                                      const uniqueTimes = [...new Set(lessonsForGradeNum.map(item => item.time))]
                                        .sort((a, b) => {
                                          const timeA = a.split('-')[0].trim();
                                          const timeB = b.split('-')[0].trim();
                                          
                                          // Нақты уақыттарды бірінші орындарға қою
                                          if (timeA === "8:00" || timeA === "08:00") return -1; // 8:00 әрқашан бірінші
                                          if (timeB === "8:00" || timeB === "08:00") return 1;
                                          
                                          if (timeA === "8:50" || timeA === "08:50") {
                                            if (timeB === "8:00" || timeB === "08:00") return 1;
                                            return -1; // 8:50 әрқашан екінші орында
                                          }
                                          if (timeB === "8:50" || timeB === "08:50") {
                                            if (timeA === "8:00" || timeA === "08:00") return -1;
                                            return 1;
                                          }
                                          
                                          const hourA = parseInt(timeA.split(':')[0] || "0");
                                          const hourB = parseInt(timeB.split(':')[0] || "0");
                                          if (hourA !== hourB) return hourA - hourB;
                                          
                                          const minuteA = parseInt(timeA.split(':')[1] || "0");
                                          const minuteB = parseInt(timeB.split(':')[1] || "0");
                                          return minuteA - minuteB;
                                        });
                                      
                                      return (
                                        <div key={`${groupName}_${gradeNum}`} className="mb-6">
                                          <h5 className="text-sm font-semibold my-2 p-1 bg-muted/20 rounded">{gradeNum}-сынып</h5>
                                          <div className="overflow-x-auto">
                                            <Table className="border-collapse border border-gray-300">
                                              <TableHeader>
                                                <TableRow className="bg-muted/30">
                                                  <TableHead rowSpan={2} className="w-[30px] border border-gray-300 text-center">№</TableHead>
                                                  <TableHead rowSpan={2} className="w-[80px] border border-gray-300">Уақыт</TableHead>
                                                  {gradesWithNum.map(grade => (
                                                    <TableHead 
                                                      key={grade}
                                                      colSpan={2}
                                                      className="w-[160px] hover:bg-accent hover:text-accent-foreground transition-colors border border-gray-300 text-center"
                                                      onClick={() => window.location.href = `?grade=${grade}&day=${day}`}
                                                      style={{ cursor: 'pointer' }}
                                                    >
                                                      <Button variant="ghost" size="sm" className="p-0 m-0 h-auto font-normal">
                                                        {grade}
                                                      </Button>
                                                    </TableHead>
                                                  ))}
                                                </TableRow>
                                                <TableRow className="bg-muted/30">
                                                  {gradesWithNum.map(grade => (
                                                    <React.Fragment key={`head_${grade}`}>
                                                      <TableHead className="border border-gray-300">Пән</TableHead>
                                                      <TableHead className="w-[60px] border border-gray-300 text-center">Каб.</TableHead>
                                                    </React.Fragment>
                                                  ))}
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {uniqueTimes.map(time => (
                                                  <TableRow key={time} className="hover:bg-muted/20">
                                                    <TableCell className="text-center font-bold border border-gray-300">{getLessonNumber(time, shift)}</TableCell>
                                                    <TableCell className="text-xs border border-gray-300">{time}</TableCell>
                                                    {gradesWithNum.map(grade => {
                                                      const lesson = lessonsForGradeNum.find(
                                                        item => item.time === time && item.grade === grade
                                                      );
                                                      
                                                      return (
                                                        <React.Fragment key={`${grade}_${time}`}>
                                                          <TableCell className={`text-xs border border-gray-300 ${lesson ? 'font-medium' : 'text-muted-foreground'}`}>
                                                            {lesson?.subject || "-"}
                                                          </TableCell>
                                                          <TableCell className="text-xs text-center border border-gray-300">{lesson?.room || "-"}</TableCell>
                                                        </React.Fragment>
                                                      );
                                                    })}
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
  
  // Әдепкі көрініс (жалпы кесте)
  return (
    <div className="text-sm">
      <Table className="border-collapse border border-gray-300">
        <TableCaption>
          {filteredByShift.length} сабақ көрсетілген
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="border border-gray-300">Күн</TableHead>
            <TableHead className="w-[30px] border border-gray-300 text-center">№</TableHead>
            <TableHead className="border border-gray-300">Уақыт</TableHead>
            <TableHead className="border border-gray-300">Сынып</TableHead>
            <TableHead className="border border-gray-300">Пән</TableHead>
            <TableHead className="border border-gray-300 text-center">Кабинет</TableHead>
            <TableHead className="border border-gray-300">Ауысым</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredByShift.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/20">
              <TableCell className="border border-gray-300">{item.day}</TableCell>
              <TableCell className="text-center font-bold border border-gray-300">{getLessonNumber(item.time, item.shift)}</TableCell>
              <TableCell className="border border-gray-300">{item.time}</TableCell>
              <TableCell className="border border-gray-300">{item.grade}</TableCell>
              <TableCell className="font-medium border border-gray-300">{item.subject}</TableCell>
              <TableCell className="border border-gray-300 text-center">{item.room}</TableCell>
              <TableCell className="border border-gray-300">{item.shift}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
