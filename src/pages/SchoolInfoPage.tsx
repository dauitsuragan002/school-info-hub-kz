
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SchoolFilters } from "@/components/school/SchoolFilters";
import { ScheduleTable } from "@/components/school/ScheduleTable";
import { BirthdaySection } from "@/components/school/BirthdaySection";
import { MapThumbnail } from "@/components/school/MapThumbnail";
import { School } from "lucide-react";

const SchoolInfoPage = () => {
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [shiftFilter, setShiftFilter] = useState<string>("all");
  
  // Sample data for demonstration
  const scheduleData = [
    { id: 1, day: "Дүйсенбі", time: "08:30 - 09:15", grade: "5А", subject: "Математика", room: "203", shift: "1" },
    { id: 2, day: "Дүйсенбі", time: "09:25 - 10:10", grade: "5А", subject: "Қазақ тілі", room: "205", shift: "1" },
    { id: 3, day: "Дүйсенбі", time: "10:30 - 11:15", grade: "5А", subject: "Ағылшын тілі", room: "304", shift: "1" },
    { id: 4, day: "Дүйсенбі", time: "14:30 - 15:15", grade: "9Б", subject: "Физика", room: "310", shift: "2" },
    { id: 5, day: "Дүйсенбі", time: "15:25 - 16:10", grade: "9Б", subject: "Химия", room: "315", shift: "2" },
    { id: 6, day: "Сейсенбі", time: "09:25 - 10:10", grade: "5А", subject: "Әдебиет", room: "205", shift: "1" },
  ];

  const studentBirthdays = [
    { id: 1, name: "Асанов Асан", grade: "5А", birthDate: "2023-04-09" },
    { id: 2, name: "Болатова Айгүл", grade: "7Б", birthDate: "2023-04-10" },
    { id: 3, name: "Сериков Нұрлан", grade: "9Г", birthDate: "2023-04-12" },
  ];

  const teacherBirthdays = [
    { id: 1, name: "Жанатова Гүлнар", subject: "Математика", birthDate: "2023-04-08" },
    { id: 2, name: "Ахметов Марат", subject: "Тарих", birthDate: "2023-04-15" },
  ];

  // Filtering logic
  const filteredSchedule = scheduleData.filter((item) => {
    const matchesGrade = gradeFilter === "all" || item.grade === gradeFilter;
    const matchesShift = shiftFilter === "all" || item.shift === shiftFilter;
    return matchesGrade && matchesShift;
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <School className="h-8 w-8" />
            Мектеп Кестесі және Ақпарат
          </h1>
          <p className="text-muted-foreground">
            Сабақ кестесі, туған күндер және мектеп картасы
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="/map">Мектеп картасы</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/admin">Әкімшілік панель</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <SchoolFilters 
        gradeFilter={gradeFilter} 
        setGradeFilter={setGradeFilter} 
        shiftFilter={shiftFilter} 
        setShiftFilter={setShiftFilter} 
      />

      {/* Schedule Table */}
      <ScheduleTable scheduleData={filteredSchedule} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* Student Birthdays */}
        <div className="lg:col-span-1">
          <BirthdaySection 
            title="Оқушылардың туған күндері" 
            data={studentBirthdays} 
            type="student" 
          />
        </div>

        {/* Teacher Birthdays */}
        <div className="lg:col-span-1">
          <BirthdaySection 
            title="Мұғалімдердің туған күндері" 
            data={teacherBirthdays} 
            type="teacher" 
          />
        </div>

        {/* Map Thumbnail */}
        <div className="lg:col-span-1">
          <MapThumbnail />
        </div>
      </div>
    </div>
  );
};

export default SchoolInfoPage;
