
import React from 'react';
import Layout from '@/components/layout/Layout';
import FileUploadForm from '@/components/upload/FileUploadForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

const UploadPage = () => {
  const { toast } = useToast();
  const { auth, logout } = useAuth();
  
  const handleUploadSchedule = (file: File) => {
    // In a real application, this would send the file to a backend API
    console.log('Uploading schedule file:', file.name);
    // Mock successful upload
    setTimeout(() => {
      toast({
        title: "Кесте жүктелді",
        description: "Сабақ кестесі сәтті жаңартылды",
      });
    }, 1000);
  };
  
  const handleUploadStudents = (file: File) => {
    console.log('Uploading students file:', file.name);
    setTimeout(() => {
      toast({
        title: "Оқушылар тізімі жүктелді",
        description: "Оқушылар туралы ақпарат сәтті жаңартылды",
      });
    }, 1000);
  };
  
  const handleUploadTeachers = (file: File) => {
    console.log('Uploading teachers file:', file.name);
    setTimeout(() => {
      toast({
        title: "Мұғалімдер тізімі жүктелді",
        description: "Мұғалімдер туралы ақпарат сәтті жаңартылды",
      });
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Жүйеден шықтыңыз",
      description: "Сіз жүйеден сәтті шықтыңыз",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Деректерді жүктеу</h1>
            <p className="text-muted-foreground">
              Excel файлдарын жүктеп, мектеп ақпаратын жаңартыңыз
            </p>
          </div>
          <div className="flex items-center bg-muted/20 px-4 py-2 rounded-md">
            <span className="text-sm mr-2">Пайдаланушы: {auth.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span>Шығу</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploadForm
            title="Сабақ кестесі"
            description="Сабақ кестесі бар Excel файлын (.xlsx) жүктеңіз"
            fileType="schedule"
            onUpload={handleUploadSchedule}
          />
          
          <FileUploadForm
            title="Оқушылар тізімі"
            description="Оқушылар туралы ақпарат бар Excel файлын (.xlsx) жүктеңіз"
            fileType="students"
            onUpload={handleUploadStudents}
          />
          
          <FileUploadForm
            title="Мұғалімдер тізімі"
            description="Мұғалімдер туралы ақпарат бар Excel файлын (.xlsx) жүктеңіз"
            fileType="teachers"
            onUpload={handleUploadTeachers}
          />
        </div>
        
        <div className="bg-muted/20 rounded-lg p-4 text-sm">
          <h3 className="font-medium mb-2">Файл форматы талаптары:</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>Кесте файлы:</strong> Міндетті бағандар: Күн, Уақыт, Сынып, Пән, Кабинет, Ауысым
            </li>
            <li>
              <strong>Оқушылар файлы:</strong> Міндетті бағандар: Аты-жөні, Сыныбы, Туған күні
            </li>
            <li>
              <strong>Мұғалімдер файлы:</strong> Міндетті бағандар: Аты-жөні, Лауазымы, Туған күні
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
