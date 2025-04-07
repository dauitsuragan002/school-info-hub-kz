
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ClipboardList } from "lucide-react";

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  grade: string;
  subject: string;
  room: string;
  shift: string;
}

interface ScheduleTableProps {
  scheduleData: ScheduleItem[];
}

export const ScheduleTable = ({ scheduleData }: ScheduleTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Сабақ кестесі
        </CardTitle>
        <CardDescription>
          Сабақ кестесі күн, сынып, пән бойынша көру
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scheduleData.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Күн</TableHead>
                  <TableHead>Уақыт</TableHead>
                  <TableHead>Сынып</TableHead>
                  <TableHead>Пән</TableHead>
                  <TableHead>Кабинет</TableHead>
                  <TableHead>Ауысым</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.day}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.room}</TableCell>
                    <TableCell>{item.shift}-ші ауысым</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-2">Сүзгіге сәйкес деректер табылмады</p>
            <p className="text-sm text-muted-foreground">Басқа сүзгі мәндерін таңдап көріңіз</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
