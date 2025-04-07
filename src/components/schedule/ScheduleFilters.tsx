
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScheduleFiltersProps {
  selectedGrade: string;
  selectedShift: string;
  onGradeChange: (grade: string) => void;
  onShiftChange: (shift: string) => void;
  availableGrades: string[];
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  selectedGrade,
  selectedShift,
  onGradeChange,
  onShiftChange,
  availableGrades
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-1/2">
        <Label htmlFor="grade-select" className="mb-2 block">
          Сынып
        </Label>
        <Select value={selectedGrade} onValueChange={onGradeChange}>
          <SelectTrigger id="grade-select" className="w-full">
            <SelectValue placeholder="Сыныбыңызды таңдаңыз" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Барлық сыныптар</SelectItem>
            {availableGrades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade} сынып
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-1/2">
        <Label htmlFor="shift-select" className="mb-2 block">
          Ауысым
        </Label>
        <Select value={selectedShift} onValueChange={onShiftChange}>
          <SelectTrigger id="shift-select" className="w-full">
            <SelectValue placeholder="Ауысымды таңдаңыз" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Барлық ауысымдар</SelectItem>
            <SelectItem value="1">1-ші ауысым</SelectItem>
            <SelectItem value="2">2-ші ауысым</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ScheduleFilters;
