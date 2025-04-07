
import { School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface DataTableProps {
  activeTab: "students" | "teachers" | "schedule";
  tableData: any[];
}

export const DataTable = ({ activeTab, tableData }: DataTableProps) => {
  const renderTableColumns = () => {
    if (activeTab === "students") {
      return (
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Аты-жөні</TableHead>
          <TableHead>Сынып</TableHead>
          <TableHead>Туған күні</TableHead>
          <TableHead>Мектеп</TableHead>
        </TableRow>
      );
    } else if (activeTab === "teachers") {
      return (
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Аты-жөні</TableHead>
          <TableHead>Пән</TableHead>
          <TableHead>Туған күні</TableHead>
          <TableHead>Мектеп</TableHead>
        </TableRow>
      );
    } else {
      return (
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Күн</TableHead>
          <TableHead>Уақыт</TableHead>
          <TableHead>Сынып</TableHead>
          <TableHead>Пән</TableHead>
          <TableHead>Кабинет</TableHead>
          <TableHead>Ауысым</TableHead>
        </TableRow>
      );
    }
  };

  const renderTableRows = () => {
    return tableData.map((row) => {
      if (activeTab === "students") {
        return (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.grade}</TableCell>
            <TableCell>{row.birthDate}</TableCell>
            <TableCell>{row.school}</TableCell>
          </TableRow>
        );
      } else if (activeTab === "teachers") {
        return (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.subject}</TableCell>
            <TableCell>{row.birthDate}</TableCell>
            <TableCell>{row.school}</TableCell>
          </TableRow>
        );
      } else {
        return (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.day}</TableCell>
            <TableCell>{row.time}</TableCell>
            <TableCell>{row.grade}</TableCell>
            <TableCell>{row.subject}</TableCell>
            <TableCell>{row.room}</TableCell>
            <TableCell>{row.shift}</TableCell>
          </TableRow>
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <School className="h-5 w-5" />
            {activeTab === "students" ? "Оқушылар тізімі" : 
             activeTab === "teachers" ? "Мұғалімдер тізімі" : 
             "Сабақ кестесі"}
          </div>
        </CardTitle>
        <CardDescription>
          Жүктелген мәліметтерді көру және басқару
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tableData.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableCaption>
                {activeTab === "students" ? "Жүктелген оқушылар тізімі" : 
                 activeTab === "teachers" ? "Жүктелген мұғалімдер тізімі" : 
                 "Жүктелген сабақ кестесі"}
              </TableCaption>
              <TableHeader>
                {renderTableColumns()}
              </TableHeader>
              <TableBody>
                {renderTableRows()}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-2">Деректер әлі жүктелмеген</p>
            <p className="text-sm text-muted-foreground">Деректерді көру үшін Excel файлын жүктеңіз</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
