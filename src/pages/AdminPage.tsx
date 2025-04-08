import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload, X, Check, RefreshCw, Files } from "lucide-react";
import { readExcelFile, getScheduleFiles, activateScheduleFile, deleteScheduleFile, ScheduleFile, readBirthdaysFromExcel } from "@/services/scheduleService";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { kk } from 'date-fns/locale';
import { toast } from "@/components/ui/use-toast";
import { FileUploadCard } from "@/components/admin/FileUploadCard";

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scheduleFiles, setScheduleFiles] = useState<ScheduleFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Таб түймесінің состояниясы
  const [activeTab, setActiveTab] = useState<string>("schedule");
  
  // Файлдар тізімін жүктеу
  useEffect(() => {
    loadScheduleFiles();
  }, []);
  
  // Файлдар тізімін жүктеу функциясы
  const loadScheduleFiles = () => {
    const files = getScheduleFiles();
    setScheduleFiles(files);
  };

  // Файл жүктеу процесі
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Жаңа прогресс объектін құру
    const newProgress: {[key: string]: number} = {};
    for (let i = 0; i < files.length; i++) {
      newProgress[files[i].name] = 0;
    }
    setUploadProgress(newProgress);
    
    // Әр файлды өңдеу
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Файл түрін тексеру
      if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
          file.type !== "application/vnd.ms-excel") {
        setUploadProgress(prev => ({...prev, [file.name]: -1})); // Қате
        errorCount++;
        continue;
      }
      
      try {
        setUploadProgress(prev => ({...prev, [file.name]: 30}));
        
        await readExcelFile(file);
        
        setUploadProgress(prev => ({...prev, [file.name]: 100}));
        successCount++;
      } catch (err) {
        console.error(`"${file.name}" файлын жүктеу кезінде қате шықты`, err);
        setUploadProgress(prev => ({...prev, [file.name]: -1})); // Қате
        errorCount++;
      }
    }
    
    // Жүктеу аяқталғаннан кейін хабарламаны көрсету
    if (successCount > 0 && errorCount > 0) {
      setSuccess(`${successCount} файл сәтті жүктелді, ${errorCount} файл қатемен аяқталды`);
    } else if (successCount > 0) {
      setSuccess(`${successCount} файл сәтті жүктелді`);
    } else if (errorCount > 0) {
      setError(`${errorCount} файл жүктеу кезінде қате шықты`);
    }
    
    loadScheduleFiles(); // Файлдар тізімін жаңарту
    
    // Файл жүктелген соң input field-ті тазарту
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setLoading(false);
  };
  
  // Файлды белсенді (көрсетілетін) ету
  const handleActivateFile = (fileId: string) => {
    try {
      activateScheduleFile(fileId);
      setSuccess("Файл белсенді етілді");
      loadScheduleFiles(); // Файлдар тізімін жаңарту
    } catch (err) {
      console.error("Файлды белсенді ету кезінде қате шықты", err);
      setError("Файлды белсенді ету кезінде қате шықты");
    }
  };
  
  // Файлды жою
  const handleDeleteFile = (fileId: string) => {
    try {
      const wasDeleted = deleteScheduleFile(fileId);
      if (wasDeleted) {
        setSuccess("Файл жойылды");
        loadScheduleFiles(); // Файлдар тізімін жаңарту
      } else {
        setError("Файлды жою кезінде қате шықты");
      }
    } catch (err) {
      console.error("Файлды жою кезінде қате шықты", err);
      setError("Файлды жою кезінде қате шықты");
    }
  };
  
  // Файл жүктеу датасын көрсету
  const formatUploadDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: kk
      });
    } catch {
      return "Белгісіз уақыт";
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Әкімшілік панель</h1>
        <p className="text-muted-foreground">
          Мектеп кестесін және ақпараттарын басқару
        </p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Сабақ кестесі</TabsTrigger>
          <TabsTrigger value="students">Оқушылар</TabsTrigger>
          <TabsTrigger value="teachers">Мұғалімдер</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сабақ кестесін жүктеу</CardTitle>
              <CardDescription>
                Excel (.xlsx) форматындағы сабақ кестесін жүктеңіз
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline"
                    disabled={loading}
                  >
                    <Files className="h-4 w-4 mr-2" />
                    Excel файлдарын таңдау
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={loadScheduleFiles}
                    title="Файлдар тізімін жаңарту"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls"
                    multiple
                    className="hidden"
                  />
                  
                  <div className="flex-1">
                    {loading && (
                      <span className="text-sm text-muted-foreground animate-pulse">
                        Файл жүктелуде...
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/')}
                  >
                    Кестені көру
                  </Button>
                </div>
                
                {/* Жүктеу прогресі */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mb-4 space-y-2">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="flex items-center text-sm">
                        <div className="w-64 truncate mr-2">{fileName}</div>
                        {progress === 100 ? (
                          <span className="text-green-600">
                            <Check className="h-4 w-4 inline" /> Сәтті жүктелді
                          </span>
                        ) : progress === -1 ? (
                          <span className="text-red-600">
                            <X className="h-4 w-4 inline" /> Қате
                          </span>
                        ) : (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Қате</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Сәтті!</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                {/* Жүктелген файлдар тізімі */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Жүктелген файлдар</h3>
                  
                  {scheduleFiles.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Жүктелген файлдар жоқ. Жаңа файл жүктеңіз.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {scheduleFiles.map(file => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatUploadDate(file.uploadDate)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleActivateFile(file.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Белсенді ету
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Оқушылар тізімін жүктеу</CardTitle>
              <CardDescription>
                Excel (.xlsx) форматындағы оқушылар тізімін жүктеңіз. Тізімде оқушылардың аты-жөні, сыныбы және туған күні болуы керек.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadCard
                title="Оқушылар тізімі"
                description="Excel (.xlsx) файлын жүктеңіз"
                acceptTypes=".xlsx"
                onFileSelect={async (file) => {
                  try {
                    setLoading(true);
                    const students = await readBirthdaysFromExcel(file, 'students');
                    toast({
                      title: "Файл сәтті жүктелді",
                      description: `${students.length} оқушы енгізілді`,
                    });
                  } catch (error) {
                    toast({
                      title: "Қате",
                      description: error instanceof Error ? error.message : "Белгісіз қате",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Мұғалімдер тізімін жүктеу</CardTitle>
              <CardDescription>
                Excel (.xlsx) форматындағы мұғалімдер тізімін жүктеңіз. Тізімде мұғалімдердің аты-жөні, пәні және туған күні болуы керек.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadCard
                title="Мұғалімдер тізімі"
                description="Excel (.xlsx) файлын жүктеңіз"
                acceptTypes=".xlsx"
                onFileSelect={async (file) => {
                  try {
                    setLoading(true);
                    const teachers = await readBirthdaysFromExcel(file, 'teachers');
                    toast({
                      title: "Файл сәтті жүктелді",
                      description: `${teachers.length} мұғалім енгізілді`,
                    });
                  } catch (error) {
                    toast({
                      title: "Қате",
                      description: error instanceof Error ? error.message : "Белгісіз қате",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
