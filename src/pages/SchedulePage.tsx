
import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ScheduleFilters from '@/components/schedule/ScheduleFilters';
import ScheduleTable from '@/components/schedule/ScheduleTable';
import { mockScheduleData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SchedulePage = () => {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Сабақ кестесі</h1>
          <p className="text-muted-foreground mb-6">
            Сынып пен ауысым бойынша сабақ кестесін қараңыз
          </p>
        </div>
        
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle>Кестені сүзу</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ScheduleFilters 
              selectedGrade={selectedGrade}
              selectedShift={selectedShift}
              onGradeChange={setSelectedGrade}
              onShiftChange={setSelectedShift}
              availableGrades={availableGrades}
            />
            
            <ScheduleTable scheduleData={filteredScheduleData} />
          </CardContent>
        </Card>
        
        <div className="bg-muted/20 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong>Ескерту:</strong> Сабақ кестесі өзгеруі мүмкін. Соңғы жаңартулар үшін мектеп әкімшілігіне хабарласыңыз.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
