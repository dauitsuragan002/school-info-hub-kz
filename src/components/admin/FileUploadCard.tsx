import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, School, Users, Book, File } from "lucide-react";
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
        <Alert className="bg-blue-50 border-blue-100 text-blue-800">
          <School className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-medium mb-1">{title}</AlertTitle>
          <AlertDescription className="text-blue-700">
            {description}
          </AlertDescription>
        </Alert>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="dropzone-file" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-1 text-sm text-gray-700 font-medium">Excel файлын жүктеу үшін басыңыз</p>
                <p className="text-xs text-gray-500">.xlsx форматындағы файлдар</p>
              </div>
              <Input 
                id="dropzone-file"
                type="file" 
                accept={acceptTypes}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-md">
                  <File className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setSelectedFile(null);
                  setFiles(null);
                  const fileInput = document.getElementById("dropzone-file") as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
              >
                Өшіру
              </Button>
            </div>
          )}
        </div>
        
        {onUpload && (
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading} 
            className="w-full bg-primary hover:bg-primary/90"
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
    <Card className="border-0 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Upload className="h-5 w-5 text-primary" />
          Файлдарды Жүктеу
        </CardTitle>
        <CardDescription>
          Мектеп мәліметтерін жүктеу үшін Excel файлдарын таңдаңыз
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {setActiveTab && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
              <Button
                variant={activeTab === "students" ? "default" : "outline"}
                onClick={() => setActiveTab("students")}
                className={`w-full ${activeTab === "students" ? "bg-primary" : "bg-white hover:bg-gray-50"}`}
              >
                <Users className="mr-2 h-4 w-4" />
                Оқушылар
              </Button>
              <Button
                variant={activeTab === "teachers" ? "default" : "outline"}
                onClick={() => setActiveTab("teachers")}
                className={`w-full ${activeTab === "teachers" ? "bg-primary" : "bg-white hover:bg-gray-50"}`}
              >
                <Users className="mr-2 h-4 w-4" />
                Мұғалімдер
              </Button>
              <Button
                variant={activeTab === "schedule" ? "default" : "outline"}
                onClick={() => setActiveTab("schedule")}
                className={`w-full ${activeTab === "schedule" ? "bg-primary" : "bg-white hover:bg-gray-50"}`}
              >
                <Book className="mr-2 h-4 w-4" />
                Сабақ кестесі
              </Button>
            </div>
          )}
        
          <Alert className="bg-blue-50 border-blue-100 text-blue-800">
            <School className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-medium">Файл талаптары</AlertTitle>
            <AlertDescription className="text-blue-700">
              Файлдар Excel форматында (.xlsx) болуы керек. Максималды өлшемі 10МБ.
            </AlertDescription>
          </Alert>
          
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center justify-center w-full">
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-1 text-sm text-gray-700 font-medium">Excel файлын жүктеу үшін басыңыз</p>
                  <p className="text-xs text-gray-500">.xlsx форматындағы файлдар</p>
                </div>
                <Input 
                  id="file-upload"
                  type="file" 
                  accept={acceptTypes}
                  multiple={onUpload !== undefined}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {files && files.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <File className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {files.length} файл таңдалды
                    </p>
                    <p className="text-xs text-gray-500">
                      {Array.from(files).map(f => f.name.substring(0, 15) + (f.name.length > 15 ? '...' : '')).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:justify-between">
        <Button 
          variant="outline" 
          onClick={() => {}} 
          className="w-full sm:w-auto bg-white hover:bg-blue-50 border-blue-100 text-blue-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Үлгі Жүктеу
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!files || uploading} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Жүктелуде..." : "Файлдарды Жүктеу"}
        </Button>
      </CardFooter>
    </Card>
  );
};
