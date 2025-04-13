import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, School, Users, Book } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadCardProps {
  activeTab?: "students" | "teachers" | "schedule";
  setActiveTab?: (tab: "students" | "teachers" | "schedule") => void;
  onUpload?: (files: FileList) => void;
  uploading?: boolean;
  // Жаңа өрістер
  title?: string;
  description?: string;
  acceptTypes?: string;
  onFileSelect?: (file: File) => void;
}

export const FileUploadCard = ({ 
  activeTab, 
  setActiveTab, 
  onUpload, 
  uploading,
  // Жаңа өрістер
  title,
  description,
  acceptTypes = ".xlsx,.xls",
  onFileSelect
}: FileUploadCardProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setSelectedFile(e.target.files[0]);
      
      // Егер onFileSelect функциясы берілген болса, бірден шақыру
      if (onFileSelect && e.target.files[0]) {
        onFileSelect(e.target.files[0]);
      }
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

    // Егер жалпы жүктеу берілген болса
    if (onUpload) {
      onUpload(files);
    }
    // Егер бір файл жүктеу берілген болса
    else if (onFileSelect && selectedFile) {
      onFileSelect(selectedFile);
    }
    
    // Reset the file input after upload
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setFiles(null);
    setSelectedFile(null);
  };

  // Егер бұл қарапайым файл жүктеу компоненті болса (tab selector жоқ)
  if (title && description) {
    return (
      <div className="space-y-4">
        <Alert>
          <School className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {description}
          </AlertDescription>
        </Alert>
        
        <div className="grid w-full items-center gap-1.5">
          <Input 
            id="file-upload"
            type="file" 
            accept={acceptTypes}
            onChange={handleFileChange}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Таңдалған файл: {selectedFile.name}
            </p>
          )}
        </div>
        
        {onUpload && (
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading} 
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Жүктелуде..." : "Файлды жүктеу"}
          </Button>
        )}
      </div>
    );
  }

  // Әдеттегі FileUploadCard көрінісі
  return (
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
          {setActiveTab && (
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
          )}
        
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
              accept={acceptTypes}
              multiple={onUpload !== undefined}
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
        <Button variant="outline" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" />
          Үлгі Жүктеу
        </Button>
        <Button onClick={handleUpload} disabled={!files || uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Жүктелуде..." : "Файлдарды Жүктеу"}
        </Button>
      </CardFooter>
    </Card>
  );
};
