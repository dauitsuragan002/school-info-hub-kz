
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, School, Users, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadCardProps {
  activeTab: "students" | "teachers" | "schedule";
  setActiveTab: (tab: "students" | "teachers" | "schedule") => void;
  onUpload: (files: FileList) => void;
  uploading: boolean;
}

export const FileUploadCard = ({ activeTab, setActiveTab, onUpload, uploading }: FileUploadCardProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
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

    onUpload(files);
    // Reset the file input after upload
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setFiles(null);
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
  );
};
