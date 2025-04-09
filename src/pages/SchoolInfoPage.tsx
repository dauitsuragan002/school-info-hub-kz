import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SchoolFilters } from "@/components/school/SchoolFilters";
import { ScheduleTable } from "@/components/school/ScheduleTable";
import { School, Map, Gift, User } from "lucide-react";
import { readScheduleFromExcel, ScheduleItem } from "@/services/scheduleService";

const SchoolInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL параметрлерін алу
  const searchParams = new URLSearchParams(location.search);
  const urlGrade = searchParams.get('grade') || "";
  const urlDay = searchParams.get('day') || "";
  const urlShift = searchParams.get('shift') || "";
  
  // Әдепкі мәндер: 5-сынып, Дүйсенбі күні
  const [gradeFilter, setGradeFilter] = useState<string>(urlGrade || "grade_5");
  const [shiftFilter, setShiftFilter] = useState<string>(urlShift || "all");
  const [dayFilter, setDayFilter] = useState<string>(urlDay || "дүйсенбі");
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Сыныптарды немесе күндерді таңдаған кезде URL-ды жаңарту
  useEffect(() => {
    const params = new URLSearchParams();
    if (gradeFilter !== "all") params.set('grade', gradeFilter);
    if (dayFilter !== "all") params.set('day', dayFilter);
    if (shiftFilter !== "all") params.set('shift', shiftFilter);
    
    const queryString = params.toString();
    navigate(queryString ? `?${queryString}` : '', { replace: true });
  }, [gradeFilter, dayFilter, shiftFilter, navigate]);
  
  // Сыныптар мен күндерді scheduleData-дан динамикалық түрде алу
  const uniqueGrades = useMemo(() => {
    if (!scheduleData || scheduleData.length === 0) return [];
    
    // Бірегей сыныптарды алу
    const grades = [...new Set(scheduleData.map(item => item.grade))];
    // Сұрыптау
    return grades.sort((a, b) => {
      // Сынып нөірін алу (мысалы "5А" -> "5")
      const numA = parseInt(a.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.match(/\d+/)?.[0] || "0");
      
      if (numA !== numB) {
        return numA - numB; // Алдымен сынып нөмірі бойынша сұрыптау
      }
      
      // Нөмірлер бірдей болса, әріп бойынша сұрыптау
      return a.localeCompare(b);
    });
  }, [scheduleData]);
  
  const uniqueDays = useMemo(() => {
    if (!scheduleData || scheduleData.length === 0) return [];
    
    // Бірегей күндерді алу
    const days = [...new Set(scheduleData.map(item => item.day))];
    
    // Апта күндерінің реті бойынша сұрыптау
    const weekDayOrder = {
      'дүйсенбі': 1, 'сейсенбі': 2, 'сәрсенбі': 3, 'бейсенбі': 4, 'жұма': 5, 'сенбі': 6,
      'понедельник': 1, 'вторник': 2, 'среда': 3, 'четверг': 4, 'пятница': 5, 'суббота': 6
    };
    
    return days.sort((a, b) => {
      const orderA = weekDayOrder[a.toLowerCase()] || 100;
      const orderB = weekDayOrder[b.toLowerCase()] || 100;
      return orderA - orderB;
    });
  }, [scheduleData]);
  
  // Кэштен деректерді оқу
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        setIsLoading(true);
        const cachedData = await readScheduleFromExcel();
        
        // console.log("Жүктелген деректер:", cachedData.length);
        
        if (cachedData.length > 0) {
          setScheduleData(cachedData);
          setError(null);
          
          // Күндерді тексеру (диагностика үшін)
          const days = [...new Set(cachedData.map(item => item.day))];
          // console.log("Қолжетімді күндер:", days);
          
          // Сыныптарды тексеру (диагностика үшін)
          const grades = [...new Set(cachedData.map(item => item.grade))];
          // console.log("Қолжетімді сыныптар:", grades);
          
          // Егер URL-да параметрлер болса, сол бойынша фильтрлерді орнату
          if (location.search) {
            const params = new URLSearchParams(location.search);
            const grade = params.get('grade');
            const day = params.get('day');
            const shift = params.get('shift');
            
            if (grade) setGradeFilter(grade);
            if (day) setDayFilter(day);
            if (shift) setShiftFilter(shift);
          } else {
            // URL-да параметрлер болмаса, әдепкі мәндерді орнату
            // Егер "дүйсенбі" күні бар болса, соны орнатамыз
            if (days.includes('дүйсенбі') || days.includes('понедельник')) {
              const mondayKey = days.find(d => d.toLowerCase() === 'дүйсенбі' || d.toLowerCase() === 'понедельник');
              if (mondayKey) {
                // console.log("Дүйсенбі күні орнатылды:", mondayKey);
                setDayFilter(mondayKey);
              }
            } else if (days.length > 0) {
              // Егер дүйсенбі жоқ болса, бірінші күнді алу
              // console.log("Бірінші күн орнатылды:", days[0]);
              setDayFilter(days[0]);
            }
            
            // 5-сынып бар болса, соны орнатамыз
            const grade5 = grades.filter(g => g.startsWith('5'));
            if (grade5.length > 0) {
              if (grade5.length === 1) {
                // Тек бір 5-сынып
                // console.log("5-сынып орнатылды:", grade5[0]);
                setGradeFilter(grade5[0]);
              } else {
                // Бірнеше 5-сынып
                // console.log("Барлық 5-сынып орнатылды");
                setGradeFilter("grade_5");
              }
            } else if (grades.length > 0) {
              // 5-сынып жоқ болса, бірінші сыныпты алу
              const firstGradeNum = grades[0].match(/\d+/)?.[0];
              if (firstGradeNum) {
                // console.log("Бірінші сынып орнатылды:", `grade_${firstGradeNum}`);
                setGradeFilter(`grade_${firstGradeNum}`);
              } else {
                setGradeFilter(grades[0]);
              }
            }
          }
        } else {
          setError('Деректер жоқ. Әкімшілік панеліне кіріп, мәліметтерді жүктеңіз.');
        }
      } catch (err) {
        setError('Деректерді жүктеу кезінде қате шықты');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCachedData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtering logic
  const filteredSchedule = useMemo(() => {
    if (!scheduleData || scheduleData.length === 0) {
      // console.log("Сүзуге деректер жоқ");
      return [];
    }

    // console.log("Сүзгі алдында деректер саны:", scheduleData.length);
    // console.log("Қолданылатын сүзгілер:", {
    //   gradeFilter,
    //   shiftFilter,
    //   dayFilter
    // });

    const filtered = scheduleData.filter((item) => {
      // Сынып сүзгісін тексеру
      let matchesGrade = gradeFilter === "all";
      
      // Егер "grade_" префиксі болса (яғни бұл сынып нөмірі)
      if (gradeFilter.startsWith("grade_")) {
        const gradeNumber = gradeFilter.substring(6); // "grade_5" -> "5"
        // Лицей және Орыс сыныптарын есепке алмай, тек сынып нөміріне сәйкес сыныптарды таңдау
        matchesGrade = item.grade.startsWith(gradeNumber) && 
                      !(/^[5-8]Ғ$/i.test(item.grade.toUpperCase())) && 
                      !(/^[5-9]В$/i.test(item.grade.toUpperCase()));
      } 
      // Егер "group_" префиксі болса (яғни бұл арнайы топ)
      else if (gradeFilter.startsWith("group_")) {
        const groupName = gradeFilter.substring(6); // "group_Лицей сыныптары" -> "Лицей сыныптары"
        
        // Лицей сыныптары
        if (groupName === "Лицей сыныптары") {
          // 5Ғ, 6Ғ, 7Ғ, 8Ғ сыныптары
          matchesGrade = /^[5-8]Ғ$/i.test(item.grade.toUpperCase());
        }
        // Орыс сыныптары
        else if (groupName === "Орыс сыныптары") {
          // 5В, 6В, 7В, 8В, 9В сыныптары
          matchesGrade = /^[5-9]В$/i.test(item.grade.toUpperCase());
        }
      }
      else if (gradeFilter !== "all") {
        // Әдеттегі сынып сүзгісі
        matchesGrade = item.grade === gradeFilter;
      }
      
      // Ауысым сүзгісін тексеру
      let matchesShift = shiftFilter === "all";
      
      if (shiftFilter !== "all") {
        // Тек item.shift мәніне сәйкес ауысымды тексеру
        matchesShift = item.shift === shiftFilter;
        
        // Лицей сыныптары (Ғ) әрқашан I ауысымға жатады
        if (shiftFilter === "I" && /^[5-8]Ғ$/i.test(item.grade.toUpperCase())) {
          matchesShift = true;
        }
        
        // Лицей сыныптары (Ғ) II ауысымға ешқашан жатпайды
        if (shiftFilter === "II" && /^[5-8]Ғ$/i.test(item.grade.toUpperCase())) {
          matchesShift = false;
        }
      }
      
      const matchesDay = dayFilter === "all" || item.day.toLowerCase() === dayFilter.toLowerCase();
      
      return matchesGrade && matchesShift && matchesDay;
    });
    
    // console.log("Сүзгіден өткен сабақ саны:", filtered.length, {
    //   gradeFilter,
    //   dayFilter,
    //   shiftFilter
    // });

    // Ауысымдарды жеке тексеру
    if (shiftFilter !== "all") {
      if (shiftFilter === "II") {
        // II ауысымдағы уақыттарды тексеру
        const times = [...new Set(filtered.map(item => item.time))].sort();
        // console.log("II ауысым сабақтарының уақыттары:", times);
        
        if (filtered.length > 0) {
          // console.log("II ауысымның сабақтары:", filtered.length);
        } else {
          // console.warn("II ауысымда (14:00+) сабақтар табылмады");
        }
      } else if (shiftFilter === "I") {
        // I ауысымдағы уақыттарды тексеру
        const times = [...new Set(filtered.map(item => item.time))].sort();
        // console.log("I ауысым сабақтарының уақыттары:", times);
        
        if (filtered.length > 0) {
          // console.log("I ауысымның сабақтары:", filtered.length);
        } else {
          // console.warn("I ауысымда (14:00-ге дейін) сабақтар табылмады");
        }
      } else {
        const shiftsInFiltered = [...new Set(filtered.map(item => item.shift))];
        // console.log("Сүзгіден кейінгі ауысымдар:", shiftsInFiltered);
        
        if (shiftsInFiltered.length === 0) {
          // console.warn(`"${shiftFilter}" ауысымына сәйкес сабақтар табылмады!`);
        }
      }
    }
    
    return filtered;
  }, [scheduleData, gradeFilter, shiftFilter, dayFilter]);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Removed the duplicate navigation header that was here */}

      {/* Filters */}
      {!isLoading && !error && scheduleData.length > 0 && (
        <SchoolFilters 
          gradeFilter={gradeFilter} 
          setGradeFilter={setGradeFilter} 
          shiftFilter={shiftFilter} 
          setShiftFilter={setShiftFilter}
          dayFilter={dayFilter}
          setDayFilter={setDayFilter}
          grades={uniqueGrades}
          days={uniqueDays}
        />
      )}

      {/* Schedule Table */}
      {isLoading ? (
        <Card className="p-6 text-center">
          <p>Сабақ кестесі жүктелуде...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
        </Card>
      ) : scheduleData.length === 0 ? (
        <Card className="p-6 text-center">
          <p>Деректер жоқ</p>
          <p className="text-sm text-muted-foreground mt-2">Сабақ кестесін жүктеу үшін әкімшілік панеліне өтіңіз</p>
        </Card>
      ) : filteredSchedule.length === 0 ? (
        <Card className="p-6 text-center text-amber-600">
          <p>Таңдалған сүзгілер бойынша деректер табылмады</p>
          <p className="text-sm text-muted-foreground mt-2">
            Басқа сынып немесе күнді таңдап көріңіз
          </p>
          {scheduleData.length > 0 && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                const days = [...new Set(scheduleData.map(item => item.day))];
                const firstDay = days[0] || "дүйсенбі";
                
                setDayFilter(firstDay);
                setGradeFilter("all");
                setShiftFilter("all");
              }}
            >
              Барлық сүзгілерді тазарту
            </Button>
          )}
        </Card>
      ) : (
        <ScheduleTable 
          scheduleData={filteredSchedule}
          shiftFilter={shiftFilter} 
          dayFilter={dayFilter}
          gradeFilter={gradeFilter}
        />
      )}
    </div>
  );
};

export default SchoolInfoPage;
