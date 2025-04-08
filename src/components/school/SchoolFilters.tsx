import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { getClassGroup } from "@/services/scheduleService";

interface SchoolFiltersProps {
  gradeFilter: string;
  setGradeFilter: (grade: string) => void;
  shiftFilter: string;
  setShiftFilter: (shift: string) => void;
  dayFilter: string;
  setDayFilter: (day: string) => void;
  grades?: string[];
  days?: string[];
}

export const SchoolFilters = ({
  gradeFilter,
  setGradeFilter,
  shiftFilter,
  setShiftFilter,
  dayFilter,
  setDayFilter,
  grades = [],
  days = []
}: SchoolFiltersProps) => {
  // Сыныптар үшін бірегей сандарды алу (5А, 5Б -> тек 5)
  const uniqueGradeNumbers = useMemo(() => {
    if (!grades || grades.length === 0) {
      // Егер grades берілмесе, әдепкі мәндерді қолдану
      return ["5", "6", "7", "8", "9", "10", "11"];
    }
    
    // Барлық сыныптардан сандарды алу
    const gradeNumbers = grades.map(grade => {
      const match = grade.match(/\d+/);
      return match ? match[0] : "";
    });
    
    // Бірегей сандар жасалады және сұрыпталады
    return [...new Set(gradeNumbers)]
      .filter(Boolean)
      .sort((a, b) => parseInt(a) - parseInt(b));
  }, [grades]);
  
  // Арнайы сынып топтары
  const specialClassGroups = useMemo(() => {
    if (!grades || grades.length === 0) return [];
    
    // Барлық сыныптарды топтау
    const groups: Record<string, string[]> = {};
    
    grades.forEach(grade => {
      const group = getClassGroup(grade);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(grade);
    });
    
    // Тек арнайы топтарды қайтару (тек қажетті топтарды көрсету)
    const specialGroups = ["Лицей сыныптары", "Орыс сыныптары"];
    return specialGroups
      .filter(group => groups[group] && groups[group].length > 0)
      .map(group => ({
        name: group,
        grades: groups[group].sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || "0");
          const numB = parseInt(b.match(/\d+/)?.[0] || "0");
          if (numA !== numB) return numA - numB;
          return a.localeCompare(b);
        })
      }));
  }, [grades]);
  
  // Күндер үшін әдепкі мәндер
  const defaultDays = [
    "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"
  ];
  
  // Күндер тізімі (егер берілсе, немесе әдепкі тізім)
  const daysList = days.length > 0 ? days : defaultDays;
  
  // Сынып нөірі таңдалған ба соны тексеру 
  const isGradeNumberSelected = (gradeNum: string): boolean => {
    // Егер бұл тікелей сынып (мысалы "5А") болса
    if (gradeFilter === gradeNum) return true;
    
    // Егер бұл grade_5 сияқты префиксі бар сынып болса
    if (gradeFilter === `grade_${gradeNum}`) return true;
    
    // Егер кез-келген осы нөмірлі сынып таңдалса (5А, 5Б)
    if (gradeFilter.startsWith(gradeNum) && gradeFilter.length > gradeNum.length) return true;
    
    return false;
  };

  // Арнайы топ таңдалғанын тексеру
  const isSpecialGroupSelected = (groupName: string): boolean => {
    return gradeFilter === `group_${groupName}`;
  };

  return (
    <div className="bg-muted/20 rounded-lg p-3 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Арнайы топтар */}
        {specialClassGroups.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Арнайы топтар</h3>
            <div className="flex flex-wrap gap-1">
              {specialClassGroups.map((group) => (
                <Button
                  key={group.name}
                  size="sm"
                  className="h-7 text-xs px-2 py-0"
                  variant={isSpecialGroupSelected(group.name) ? "default" : "outline"}
                  onClick={() => {
                    if (isSpecialGroupSelected(group.name)) {
                      setGradeFilter("all");
                    } else {
                      // Арнайы топты таңдау
                      if (dayFilter === "all") {
                        setDayFilter(daysList[0] || "дүйсенбі");
                      }
                      setGradeFilter(`group_${group.name}`);
                    }
                  }}
                >
                  {group.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Сыныптар */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Сыныптар</h3>
          <div className="flex flex-wrap gap-1">
            {uniqueGradeNumbers.map((gradeNum) => (
              <Button
                key={gradeNum}
                size="sm"
                className="h-7 text-xs px-2 py-0"
                variant={isGradeNumberSelected(gradeNum) ? "default" : "outline"}
                onClick={() => {
                  if (gradeFilter === `grade_${gradeNum}`) {
                    setGradeFilter("all");
                  } else {
                    const matchingGrades = grades.filter(g => g.startsWith(gradeNum));
                    if (matchingGrades.length === 1) {
                      setGradeFilter(matchingGrades[0]);
                    } else {
                      if (dayFilter === "all") {
                        setDayFilter(daysList[0] || "дүйсенбі");
                      }
                      setGradeFilter("grade_" + gradeNum);
                    }
                  }
                }}
              >
                {gradeNum}
              </Button>
            ))}
          </div>
        </div>

        {/* Ауысым */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Ауысым</h3>
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              className="h-7 text-xs px-2 py-0"
              variant={shiftFilter === "I" ? "default" : "outline"}
              onClick={() => setShiftFilter(shiftFilter === "I" ? "all" : "I")}
            >
              I
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-2 py-0"
              variant={shiftFilter === "II" ? "default" : "outline"}
              onClick={() => setShiftFilter(shiftFilter === "II" ? "all" : "II")}
            >
              II
            </Button>
          </div>
        </div>

        {/* Күндер */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Күндер</h3>
          <div className="flex flex-wrap gap-1">
            {daysList.map((day) => (
              <Button
                key={day}
                size="sm"
                className="h-7 text-xs px-2 py-0"
                variant={dayFilter.toLowerCase() === day.toLowerCase() ? "default" : "outline"}
                onClick={() => setDayFilter(dayFilter.toLowerCase() === day.toLowerCase() ? "all" : day)}
              >
                {day.charAt(0).toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
