
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export function useAdminData() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "schedule">("students");
  const { toast } = useToast();
  
  const handleUpload = async (files: FileList) => {
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

  return {
    activeTab,
    setActiveTab,
    tableData,
    uploading,
    handleUpload
  };
}
