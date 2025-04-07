
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, School, Book, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const AdminPage = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "schedule">("students");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Файлдар таңдалмаған",
        description: "Жүктеу үшін файлдарды таңдаңыз",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    // This is a mock upload - in a real implementation, you'd send files to a server
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate some sample data after upload based on the active tab
      if (activeTab === "students") {
        setTableData([
          { id: 1, name: "Асқар Мұхтар", grade: "9-A", birthDate: "2006-05-15", school: "№5 мектеп" },
          { id: 2, name: "Айнұр Серікова", grade: "10-Б", birthDate: "2005-07-22", school: "№5 мектеп" },
          { id: 3, name: "Бақыт Нұрланов", grade: "11-В", birthDate: "2004-11-03", school: "№5 мектеп" },
          { id: 4, name: "Гүлнұр Қалиева", grade: "9-Г", birthDate: "2006-03-19", school: "№5 мектеп" },
          { id: 5, name: "Дәулет Жұмағұлов", grade: "10-А", birthDate: "2005-09-28", school: "№5 мектеп" }
        ]);
      } else if (activeTab === "teachers") {
        setTableData([
          { id: 1, name: "Әсел Қасымова", subject: "Математика", birthDate: "1985-04-12", school: "№5 мектеп" },
          { id: 2, name: "Болат Ахметов", subject: "Физика", birthDate: "1978-08-29", school: "№5 мектеп" },
          { id: 3, name: "Сәуле Нұрғалиева", subject: "Биология", birthDate: "1982-12-10", school: "№5 мектеп" },
          { id: 4, name: "Марат Тәжібаев", subject: "Химия", birthDate: "1975-06-05", school: "№5 мектеп" },
          { id: 5, name: "Жаңыл Бекетова", subject: "Тарих", birthDate: "1988-02-17", school: "№5 мектеп" }
        ]);
      } else {
        setTableData([
          { id: 1, day: "Дүйсенбі", time: "08:00-08:45", grade: "9-A", subject: "Математика", room: "204", shift: "1" },
          { id: 2, day: "Дүйсенбі", time: "08:55-09:40", grade: "9-A", subject: "Физика", room: "305", shift: "1" },
          { id: 3, day: "Дүйсенбі", time: "09:50-10:35", grade: "9-A", subject: "Қазақ тілі", room: "103", shift: "1" },
          { id: 4, day: "Дүйсенбі", time: "10:45-11:30", grade: "9-A", subject: "Тарих", room: "207", shift: "1" },
          { id: 5, day: "Дүйсенбі", time: "11:40-12:25", grade: "9-A", subject: "Биология", room: "310", shift: "1" }
        ]);
      }
      
      toast({
        title: "Жүктеу сәтті аяқталды",
        description: `${files.length} файл сәтті жүктелді`,
      });
      
      setFiles(null);
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Жүктеу сәтсіз аяқталды",
        description: "Файлдарды жүктеу кезінде қате орын алды",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a link to download the template file
    const link = document.createElement("a");
    link.href = "/data_template.xlsx"; // This should match the path in the public folder
    link.download = "data_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Мектеп Мәліметтерін Басқару Панелі</h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Файлдарды Жүктеу
              </div>
            </CardTitle>
            <CardDescription>
              Мектеп мәліметтерін жүктеу үшін Excel файлдарын таңдаңыз
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4 mb-4">
                <Button
                  variant={activeTab === "students" ? "default" : "outline"}
                  onClick={() => setActiveTab("students")}
                  className="flex-1"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Оқушылар
                </Button>
                <Button
                  variant={activeTab === "teachers" ? "default" : "outline"}
                  onClick={() => setActiveTab("teachers")}
                  className="flex-1"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Мұғалімдер
                </Button>
                <Button
                  variant={activeTab === "schedule" ? "default" : "outline"}
                  onClick={() => setActiveTab("schedule")}
                  className="flex-1"
                >
                  <Book className="mr-2 h-4 w-4" />
                  Сабақ кестесі
                </Button>
              </div>
            
              <Alert>
                <School className="h-4 w-4" />
                <AlertTitle>Файл талаптары</AlertTitle>
                <AlertDescription>
                  Файлдар Excel форматында (.xlsx) болуы керек. Максималды өлшемі 10МБ.
                </AlertDescription>
              </Alert>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input 
                  id="file-upload"
                  type="file" 
                  accept=".xlsx,.xls"
                  multiple
                  onChange={handleFileChange}
                />
                {files && files.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {files.length} файл таңдалды
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Үлгі Жүктеу
            </Button>
            <Button onClick={handleUpload} disabled={!files || uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Жүктелуде..." : "Файлдарды Жүктеу"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Жүктеу Нұсқаулығы
              </div>
            </CardTitle>
            <CardDescription>
              Мектеп мәліметтерін дұрыс жүктеу үшін осы қадамдарды орындаңыз
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>"Үлгі Жүктеу" батырмасын басу арқылы Excel үлгі файлын жүктеңіз</li>
              <li>Үлгі форматына сәйкес мәліметтерді толтырыңыз</li>
              <li>Excel файлын сақтаңыз</li>
              <li>Жоғарыдағы жүктеу батырмасы арқылы файлды таңдаңыз</li>
              <li>"Файлдарды Жүктеу" батырмасын басып, мәліметтерді жүктеңіз</li>
              <li>Жүктелген мәліметтер төмендегі кестеде көрсетіледі</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      {/* Table section */}
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
    </div>
  );
};

export default AdminPage;
