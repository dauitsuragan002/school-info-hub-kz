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

const dayButtons = [
  { value: "дүйсенбі", label: "ДС" },
  { value: "сейсенбі", label: "СС" },
  { value: "сәрсенбі", label: "СР" },
  { value: "бейсенбі", label: "БС" },
  { value: "жұма", label: "Ж" }
];

export const ScheduleTable = ({ scheduleData, shiftFilter = "all", dayFilter = "all", gradeFilter = "all" }: ScheduleTableProps) => {
  // console.log("ScheduleTable компоненті басталды, фильтрлер:", { shiftFilter, dayFilter, dataLength: scheduleData.length });

  // Ауысымдарды тексеру
  useEffect(() => {
    // console.log("Деректердегі ауысымдар:", [...new Set(scheduleData.map(item => item.shift))]);
    
    // II ауысым сабақтарының уақыттарын тексеру
    const shift2Lessons = scheduleData.filter(item => item.shift === "II");
    if (shift2Lessons.length > 0) {
      const times = [...new Set(shift2Lessons.map(item => item.time))].sort();
      // console.log("II ауысым сабақтарының уақыттары:", times);
      
      const firstLessonTime = times[0]?.split('-')[0]?.trim();
      // console.log("II ауысымның бірінші сабағының уақыты:", firstLessonTime);
    }
  }, [scheduleData]);

  // Дұрыс ауысым деректерін таңдау (әрқашан ауысымға байланысты қатаң сүзгі)
  const filteredByShift = useMemo(() => {
    // Артық сүзуді болдырмау, деректер тікелей сүзілген түрде келеді
    // console.log("Сүзілген деректер саны:", scheduleData.length);
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
  
  // console.log("ScheduleTable компоненті: деректер саны", filteredByShift.length);
  // console.log("Бірегей күндер:", [...new Set(filteredByShift.map(item => item.day))]);

  // Егер тек бір сынып таңдалған болса (толық кесте көрсету)
  const isOneGradeSelected = organizedData.uniqueGrades.length === 1;
  
  if (isOneGradeSelected) {
    const grade = organizedData.uniqueGrades[0];
    const gradeData = organizedData.byGradeAndDay[grade];
    
    // console.log("Бір сынып таңдалды:", grade);
    // console.log("Сыныптың күндері:", Object.keys(gradeData || {}));
    
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
                              <TableCell className="text-center font-bold border border-gray-300">{item.lessonNumber}</TableCell>
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
  
  // console.log("Күн таңдалды:", isDaySelected, {
  //   uniqueDays: organizedData.uniqueDays,
  //   dayFilter
  // });
                       
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
    
    // console.log("Көрсетілетін ауысымдар:", shiftsToShow);
    
    return (
      <div className="by-day-view">
        {filteredDays.map(day => {
          // Күн атауын әдемілеу
          const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
          
          // Ауысым таңдау
          const shiftsToShow = shiftFilter !== "all" 
            ? [shiftFilter] 
            : organizedData.uniqueShifts;
          
          // console.log("Көрсетілетін ауысымдар:", shiftsToShow);
          
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
                const lessonsInShift = filteredByShift.filter(item => 
                  item.shift === shift && 
                  item.day.toLowerCase() === day.toLowerCase()
                );
                
                if (lessonsInShift.length === 0) {
                  // // console.log(`${shift} ауысымында сабақтар жоқ`);
                  return null;
                }
                
                // // console.log(`${shift} ауысымында ${lessonsInShift.length} сабақ бар`);
                
                return (
                  // Ауысымды Card ішіне орналастыру
                  <Card key={shift} className="mb-6 shadow-md">
                    <CardHeader className="bg-muted/30 py-3 px-4 rounded-t-lg">
                      <CardTitle className="text-lg">{shift} ауысым</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 md:p-4">
                      {/* Сынып топтары бойынша көрсету */}
                      {Object.keys(organizedData.gradeGroups).map(groupName => {
                        const gradesInGroup = organizedData.gradeGroups[groupName];
                        const lessonsForGroup = lessonsInShift.filter(item => gradesInGroup.includes(item.grade));
                        
                        if (lessonsForGroup.length === 0) return null;
                        
                        return (
                          <div key={groupName} className="mb-4 last:mb-0">
                            {/* Топ тақырыбын алып тастаймыз */}
                            
                            {/* Кесте */}
                            {/* Card-ты алып тастаймыз, себебі ауысым деңгейінде Card бар */}
                            {groupName === "Орыс сыныптары" || groupName === "Лицей сыныптары" ? (
                              <div className="overflow-x-auto">
                                <Table className="border-collapse border border-gray-300 w-full">
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
                                          onClick={() => {
                                            const params = new URLSearchParams();
                                            params.set('grade', grade);
                                            if (day) {
                                              params.set('day', day);
                                            }
                                            window.location.href = `?${params.toString()}`;
                                          }}
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
                                          <TableCell className="text-center font-bold border border-gray-300">{lessonsForGroup.find(l => l.time === time)?.lessonNumber || '-'}</TableCell>
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
                                      <div key={`${groupName}_${gradeNum}`} className="mb-6 last:mb-0">
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
                                                    onClick={() => {
                                                      const params = new URLSearchParams();
                                                      params.set('grade', grade);
                                                      if (day) {
                                                        params.set('day', day);
                                                      }
                                                      window.location.href = `?${params.toString()}`;
                                                    }}
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
                                                  <TableCell className="text-center font-bold border border-gray-300">{lessonsForGradeNum.find(l => l.time === time)?.lessonNumber || '-'}</TableCell>
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
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
  
  // Күн аттарын қысқарту функциясы
  const getShortDayName = (fullDay: string): string => {
    const dayMap: Record<string, string> = {
      'дүйсенбі': 'ДС',
      'сейсенбі': 'СС',
      'сәрсенбі': 'СР',
      'бейсенбі': 'БС',
      'жұма': 'ЖМ',
      // Орыс тіліндегі күндер үшін де қысқартулар
      'понедельник': 'ПН',
      'вторник': 'ВТ',        
      'среда': 'СР',
      'четверг': 'ЧТ',
      'пятница': 'ПТ'
    };
    return dayMap[fullDay.toLowerCase()] || fullDay;
  };

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
              <TableCell className="border border-gray-300">{getShortDayName(item.day)}</TableCell>
              <TableCell className="text-center font-bold border border-gray-300">{item.lessonNumber}</TableCell>
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
