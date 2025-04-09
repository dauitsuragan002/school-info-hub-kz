import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, ArrowLeft, Filter } from "lucide-react";
import { BirthdaySection } from "@/components/school/BirthdaySection";
import { getStudents, getTeachers, StudentItem, TeacherItem } from "@/services/scheduleService";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BirthdaysPage = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "lyceum" | "regular">("all");
  const [activeGrade, setActiveGrade] = useState<string>("all");

  // Туған күн деректерін жүктеу
  useEffect(() => {
    // Кэштен оқушылар мен мұғалімдер деректерін алу
    const fetchData = () => {
      try {
        setIsLoading(true);
        const studentsData = getStudents();
        const teachersData = getTeachers();
        
        setStudents(studentsData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Деректерді жүктеу кезінде қате:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Оқушыларды сүзгілеу
  const filteredStudents = students.filter(student => {
    // Сыныпты тексеру
    const matchesGrade = activeGrade === "all" || student.grade === activeGrade;
    
    // Категорияны тексеру
    const isLyceum = student.grade?.includes("Ғ");
    const isRussian = student.grade?.includes("В");
    
    if (activeFilter === "all") return matchesGrade;
    if (activeFilter === "lyceum") return isLyceum && matchesGrade;
    if (activeFilter === "regular") return isRussian && matchesGrade;
    return false;
  });

  // Уникальные классы для фильтра
  const allGrades = ["all", ...new Set(students.map(student => student.grade || ""))];

  // Категорияға байланысты сыныптар тізімін фильтрлеу
  const filteredGrades = allGrades.filter(grade => {
    if (grade === "all") return true;
    // Лицей сыныптары мен орыс сыныптарын "Сыныптар" бөлімінде көрсетпейміз
    return !grade.includes("Ғ") && !grade.includes("В");
  }).sort();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Басты бетке оралу
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Gift className="h-8 w-8" />
            Туған күндер
          </h1>
          <p className="text-muted-foreground">
            Оқушылар мен мұғалімдердің туған күндері
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6 text-center">
          <p>Туған күндер тізімі жүктелуде...</p>
        </Card>
      ) : students.length === 0 && teachers.length === 0 ? (
        <Card className="p-6 text-center">
          <CardContent className="pt-6">
            <p className="mb-2">Туған күн деректері жоқ</p>
            <p className="text-sm text-muted-foreground mb-4">
              Оқушылар мен мұғалімдердің туған күн деректерін көру үшін алдымен оларды Әкімшілік панельден жүктеу қажет.
            </p>
            <Button variant="outline" asChild>
              <Link to="/admin">Әкімшілік панельге өту</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Минималистик сүзгілер */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Арнайы топтар
                  </h3>
                  <Tabs defaultValue="all" value={activeFilter} onValueChange={(value) => {
                    setActiveFilter(value as "all" | "lyceum" | "regular");
                    // Арнайы топ таңдалған кезде "all" сыныбын таңдаймыз
                    if (value !== "all") {
                      setActiveGrade("all");
                    }
                  }}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">Барлығы</TabsTrigger>
                      <TabsTrigger value="lyceum">Лицей сыныптары</TabsTrigger>
                      <TabsTrigger value="regular">Орыс сыныптары</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* "Арнайы топтар" таңдалған кезде Сыныптар бөлімін жасырамыз */}
                {activeFilter === "all" && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Filter className="h-3 w-3" /> Сыныптар
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {filteredGrades.map(grade => (
                        <Button 
                          key={grade} 
                          variant={grade === activeGrade ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setActiveGrade(grade)}
                        >
                          {grade === "all" ? "Барлығы" : grade}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Оқушылар секциясы */}
            <BirthdaySection
              title="Оқушылардың туған күндері"
              data={filteredStudents}
              type="student"
            />
            
            {/* Мұғалімдер секциясы */}
            <BirthdaySection
              title="Мұғалімдердің туған күндері"
              data={teachers}
              type="teacher"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BirthdaysPage; 