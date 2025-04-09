import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload, X, Check, RefreshCw, Files, Settings, Users, Key, Eye } from "lucide-react";
import { readExcelFile, getScheduleFiles, activateScheduleFile, deleteScheduleFile, ScheduleFile, readBirthdaysFromExcel } from "@/services/scheduleService";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { kk } from 'date-fns/locale';
import { toast } from "@/components/ui/use-toast";
import { FileUploadCard } from "@/components/admin/FileUploadCard";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { AdminNav } from "@/components/AdminNav";
import { SetupPasswordCard } from "@/components/admin/SetupPasswordCard";

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scheduleFiles, setScheduleFiles] = useState<ScheduleFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Таб түймесінің состояниясы
  const [activeTab, setActiveTab] = useState<string>("schedule");
  
  // Файлдар тізімін жүктеу
  useEffect(() => {
    if (isAuthenticated) {
      loadScheduleFiles();
    }
  }, [isAuthenticated]);
  
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
    <div className="min-h-screen bg-gray-50 pb-12">
      {authLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-gray-600 font-medium">Жүктелуде...</p>
            </div>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="max-w-md mx-auto mt-10 p-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <LoginForm />
          </div>
        </div>
      ) : (
        <>
          <AdminNav title="Әкімшілік панель" />
          
          <div className="container mx-auto mt-8">
            <Tabs defaultValue="schedule" className="space-y-6" onValueChange={setActiveTab}>
              <TabsList className="admin-tabs w-full flex flex-wrap sm:flex-nowrap border p-1 mb-6">
                <TabsTrigger 
                  value="schedule" 
                  className="flex items-center justify-center gap-2 flex-1 min-w-[100px]"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Сабақ кестесі</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="students" 
                  className="flex items-center justify-center gap-2 flex-1 min-w-[100px]"
                >
                  <Users className="h-4 w-4" />
                  <span>Оқушылар</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="teachers" 
                  className="flex items-center justify-center gap-2 flex-1 min-w-[100px]"
                >
                  <Users className="h-4 w-4" />
                  <span>Мұғалімдер</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center justify-center gap-2 flex-1 min-w-[100px]"
                >
                  <Settings className="h-4 w-4" />
                  <span>Баптаулар</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="space-y-6">
                <Card className="overflow-hidden border-0 shadow-md rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      Сабақ кестесін жүктеу
                    </CardTitle>
                    <CardDescription>
                      Excel (.xlsx) форматындағы сабақ кестесін жүктеңіз
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 mb-6">
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          variant="outline"
                          disabled={loading}
                          className="w-full sm:w-auto bg-white font-medium"
                        >
                          <Files className="h-4 w-4 mr-2 text-primary" />
                          Excel файлдарын таңдау
                        </Button>
                        
                        <Button
                          variant="ghost"
                          onClick={loadScheduleFiles}
                          title="Файлдар тізімін жаңарту"
                          className="w-auto h-10 aspect-square p-0 rounded-full"
                        >
                          <RefreshCw className="h-4 w-4 text-gray-500" />
                        </Button>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".xlsx,.xls"
                          multiple
                          className="hidden"
                        />
                        
                        <div className="flex-1 w-full sm:w-auto">
                          {loading && (
                            <div className="flex items-center text-sm text-primary space-x-2 animate-pulse">
                              <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                              <span>Файл жүктелуде...</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          variant="default" 
                          onClick={() => navigate('/')}
                          className="w-full sm:w-auto mt-2 sm:mt-0 bg-primary hover:bg-primary/90"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Кестені көру
                        </Button>
                      </div>
                      
                      {/* Жүктеу прогресі */}
                      {Object.keys(uploadProgress).length > 0 && (
                        <div className="mb-6 space-y-3 bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Жүктеу үдерісі</h3>
                          {Object.entries(uploadProgress).map(([fileName, progress]) => (
                            <div key={fileName} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm bg-white p-3 rounded-md shadow-sm">
                              <div className="flex items-center max-w-full truncate">
                                <FileSpreadsheet className="h-4 w-4 text-gray-400 flex-shrink-0 mr-2" />
                                <span className="truncate mr-2">{fileName}</span>
                              </div>
                              <div className="mt-2 sm:mt-0">
                                {progress === 100 ? (
                                  <span className="badge badge-success">
                                    <Check className="h-3 w-3 mr-1" /> Сәтті жүктелді
                                  </span>
                                ) : progress === -1 ? (
                                  <span className="badge badge-error">
                                    <X className="h-3 w-3 mr-1" /> Қате
                                  </span>
                                ) : (
                                  <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 min-w-[40px]">
                                      {progress}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {error && (
                        <Alert variant="destructive" className="mb-4 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Қате</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 rounded-lg">
                          <Check className="h-4 w-4" />
                          <AlertTitle>Сәтті!</AlertTitle>
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Жүктелген файлдар тізімі */}
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-800">Жүктелген файлдар</h3>
                          <div className="text-xs text-gray-500">
                            {scheduleFiles.length} файл
                          </div>
                        </div>
                        
                        {scheduleFiles.length === 0 ? (
                          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center">
                            <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-gray-500 text-sm">
                              Жүктелген файлдар жоқ. Жаңа файл жүктеңіз.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {scheduleFiles.map(file => (
                              <div 
                                key={file.id} 
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                  <div className="p-2 bg-green-50 rounded-md">
                                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatUploadDate(file.uploadDate)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleActivateFile(file.id)}
                                    className="bg-white hover:bg-green-50 border-green-200 text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Белсенді ету
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="bg-white hover:bg-red-50 border-red-200 text-red-500 hover:text-red-600"
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
              
              <TabsContent value="students" className="space-y-6">
                <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Users className="h-5 w-5 text-primary" />
                      Оқушылар тізімін жүктеу
                    </CardTitle>
                    <CardDescription>
                      Excel (.xlsx) форматындағы оқушылар тізімін жүктеңіз. Тізімде оқушылардың аты-жөні, сыныбы және туған күні болуы керек.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="upload-card">
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="teachers" className="space-y-6">
                <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Users className="h-5 w-5 text-primary" />
                      Мұғалімдер тізімін жүктеу
                    </CardTitle>
                    <CardDescription>
                      Excel (.xlsx) форматындағы мұғалімдер тізімін жүктеңіз. Тізімде мұғалімдердің аты-жөні, пәні және туған күні болуы керек.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="upload-card">
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Баптаулар бөлімі */}
                  <div>
                    <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <Key className="h-5 w-5 text-primary" />
                          Әкімші паролін орнату
                        </CardTitle>
                        <CardDescription>
                          Жүйеге кіру үшін қауіпсіз пароль орнатыңыз
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <SetupPasswordCard />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="md:col-span-1">
                    <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <Settings className="h-5 w-5 text-primary" />
                          Жүйе туралы
                        </CardTitle>
                        <CardDescription>
                          Жүйе туралы ақпарат және баптаулар
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Нұсқа:</span>
                            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md font-mono">1.0.0</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Орта:</span>
                            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md font-mono">{process.env.NODE_ENV || 'development'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
