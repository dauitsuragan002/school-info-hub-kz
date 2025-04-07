
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload } from "lucide-react";
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
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    // This is a mock upload - in a real implementation, you'd send files to a server
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate some sample data after upload
      setTableData([
        { id: 1, name: "Асқар Мұхтар", school: "№5 мектеп", grade: "9-A", subject: "Математика" },
        { id: 2, name: "Айнұр Серікова", school: "№12 гимназия", grade: "10-Б", subject: "Физика" },
        { id: 3, name: "Бақыт Нұрланов", school: "№8 лицей", grade: "11-В", subject: "Химия" },
        { id: 4, name: "Гүлнұр Қалиева", school: "№3 мектеп", grade: "9-Г", subject: "Биология" },
        { id: 5, name: "Дәулет Жұмағұлов", school: "№7 мектеп", grade: "10-А", subject: "Информатика" }
      ]);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${files.length} file(s)`,
      });
      
      setFiles(null);
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Upload your data files here. Make sure they follow the correct format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTitle>File Requirements</AlertTitle>
                <AlertDescription>
                  Files must be in Excel format (.xlsx). Maximum size is 10MB.
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
                    {files.length} file(s) selected
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button onClick={handleUpload} disabled={!files || uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
            <CardDescription>
              Follow these steps to upload your data correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Download the template Excel file by clicking the "Download Template" button</li>
              <li>Fill in your data according to the template format</li>
              <li>Save your Excel file</li>
              <li>Select your file using the upload button above</li>
              <li>Click "Upload Files" to submit your data</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      {/* Table section */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Data</CardTitle>
          <CardDescription>
            View and manage your uploaded information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableCaption>Жүктелген мәліметтер тізімі</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Аты-жөні</TableHead>
                    <TableHead>Мектеп</TableHead>
                    <TableHead>Сынып</TableHead>
                    <TableHead>Пән</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.school}</TableCell>
                      <TableCell>{row.grade}</TableCell>
                      <TableCell>{row.subject}</TableCell>
                    </TableRow>
                  ))}
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
