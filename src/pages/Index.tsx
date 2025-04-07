
import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ScheduleFilters from '@/components/schedule/ScheduleFilters';
import ScheduleTable from '@/components/schedule/ScheduleTable';
import { mockScheduleData, mockStudentsData, mockTeachersData, getUpcomingBirthdays } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Index = () => {
  // Schedule filters state
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<string>("all");
  
  // Get unique grades from schedule data
  const availableGrades = useMemo(() => {
    const grades = new Set(mockScheduleData.map(item => item.grade));
    return Array.from(grades).sort((a, b) => Number(a) - Number(b));
  }, []);
  
  // Filter schedule data based on selected filters
  const filteredScheduleData = useMemo(() => {
    return mockScheduleData.filter(item => {
      const matchesGrade = selectedGrade === "all" || item.grade === selectedGrade;
      const matchesShift = selectedShift === "all" || item.shift === selectedShift;
      return matchesGrade && matchesShift;
    });
  }, [selectedGrade, selectedShift]);
  
  // Get upcoming birthdays
  const upcomingStudentBirthdays = useMemo(() => 
    getUpcomingBirthdays(mockStudentsData, 3), []);
  
  const upcomingTeacherBirthdays = useMemo(() => 
    getUpcomingBirthdays(mockTeachersData, 3), []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Мектеп кестесі</h1>
          <p className="text-muted-foreground mb-6">
            Сабақ кестесін және оқушылар мен мұғалімдер туралы ақпаратты қараңыз
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Сабақ кестесі</h2>
              
              <ScheduleFilters 
                selectedGrade={selectedGrade}
                selectedShift={selectedShift}
                onGradeChange={setSelectedGrade}
                onShiftChange={setSelectedShift}
                availableGrades={availableGrades}
              />
              
              <ScheduleTable scheduleData={filteredScheduleData} />
              
              <div className="mt-4 text-right">
                <Button variant="outline" asChild>
                  <Link to="/schedule">Толық кестені көру</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Жақын туған күндер</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Оқушылар</h3>
                {upcomingStudentBirthdays.length > 0 ? (
                  <ul className="space-y-2">
                    {upcomingStudentBirthdays.map((student, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{student.name}</span>
                        <div className="text-muted-foreground">{student.grade} сынып</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Жақын арада туған күндер жоқ</p>
                )}
                
                <h3 className="text-lg font-medium pt-2">Мұғалімдер</h3>
                {upcomingTeacherBirthdays.length > 0 ? (
                  <ul className="space-y-2">
                    {upcomingTeacherBirthdays.map((teacher, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{teacher.name}</span>
                        <div className="text-muted-foreground">{teacher.position}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Жақын арада туған күндер жоқ</p>
                )}
              </div>
              
              <div className="mt-4 text-right">
                <Button variant="outline" asChild>
                  <Link to="/birthdays">Барлық туған күндерді көру</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Мектеп картасы</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Мектеп ғимаратының интерактивті картасын көру арқылы бағдарлану
              </p>
              <Button className="w-full" asChild>
                <Link to="/map" className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Картаны ашу</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
