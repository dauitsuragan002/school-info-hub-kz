
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FilterIcon } from "lucide-react";

interface SchoolFiltersProps {
  gradeFilter: string;
  setGradeFilter: (value: string) => void;
  shiftFilter: string;
  setShiftFilter: (value: string) => void;
}

export const SchoolFilters = ({
  gradeFilter,
  setGradeFilter,
  shiftFilter,
  setShiftFilter
}: SchoolFiltersProps) => {
  // Array with grade options
  const grades = [
    "1А", "1Б", "1В", "1Г", 
    "2А", "2Б", "2В", "2Г",
    "3А", "3Б", "3В", "3Г",
    "4А", "4Б", "4В", "4Г",
    "5А", "5Б", "5В", "5Г",
    "6А", "6Б", "6В", "6Г",
    "7А", "7Б", "7В", "7Г",
    "8А", "8Б", "8В", "8Г",
    "9А", "9Б", "9В", "9Г",
    "10А", "10Б", "10В",
    "11А", "11Б", "11В"
  ];

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FilterIcon className="h-5 w-5" />
            <span>Кесте сүзгісі:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-60">
              <label htmlFor="grade-filter" className="block text-sm font-medium mb-2">
                Сынып
              </label>
              <Select 
                value={gradeFilter} 
                onValueChange={setGradeFilter}
              >
                <SelectTrigger id="grade-filter">
                  <SelectValue placeholder="Барлық сыныптар" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Барлық сыныптар</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-60">
              <label htmlFor="shift-filter" className="block text-sm font-medium mb-2">
                Ауысым
              </label>
              <Select 
                value={shiftFilter} 
                onValueChange={setShiftFilter}
              >
                <SelectTrigger id="shift-filter">
                  <SelectValue placeholder="Барлық ауысымдар" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Барлық ауысымдар</SelectItem>
                  <SelectItem value="1">1-ші ауысым</SelectItem>
                  <SelectItem value="2">2-ші ауысым</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
