import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { readExcelFile, ScheduleItem } from "@/services/scheduleService";

export interface StudentItem {
  id: number;
  name: string;
  grade: string;
  birthDate: string;
  school: string;
}

export interface TeacherItem {
  id: number;
  name: string;
  subject: string;
  birthDate: string;
  school: string;
}

export function useAdminData() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "schedule">("students");
  const { toast } = useToast();
  
  const handleUpload = async (files: FileList) => {
    setUploading(true);
    
    try {
      const file = files[0]; // Бірінші файлды алу
      
      // Файл түрін тексеру
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Жүктеу сәтсіз аяқталды",
          description: "Тек Excel файлдары (.xlsx, .xls) қолданылады",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      // Excel файлын оқу
      let data = await readExcelFile(file);
      
      if (data.length === 0) {
        toast({
          title: "Жүктеу сәтсіз аяқталды",
          description: "Файлда деректер табылмады немесе формат дұрыс емес",
          variant: "destructive",
        });
      } else {
        // Деректерді көрсету
        setTableData(data);
        
        toast({
          title: "Жүктеу сәтті аяқталды",
          description: `${file.name} файлы сәтті жүктелді`,
        });
      }
    } catch (error) {
      console.error("Файл жүктеу қатесі:", error);
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
