
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface FileUploadFormProps {
  title: string;
  description: string;
  fileType: 'schedule' | 'students' | 'teachers';
  onUpload: (file: File) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ title, description, fileType, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      // Check if the file is an Excel file
      if (!selectedFile.name.endsWith('.xlsx')) {
        toast({
          title: "Қате файл форматы",
          description: "Тек .xlsx форматындағы файл жүктеңіз",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      try {
        onUpload(file);
        toast({
          title: "Файл жүктелді",
          description: `${title} файлы сәтті жүктелді.`,
        });
        setFile(null);
        // Reset the file input
        const fileInput = document.getElementById(`${fileType}-file`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } catch (error) {
        toast({
          title: "Қате",
          description: "Файлды жүктеу кезінде қате орын алды",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Файл таңдалмаған",
        description: "Жүктеу үшін файлды таңдаңыз",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={`${fileType}-file`}>Excel файлын таңдаңыз (.xlsx)</Label>
            <Input 
              id={`${fileType}-file`} 
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Таңдалған: {file.name}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!file} className="gap-2">
            <Upload className="h-4 w-4" />
            <span>Жүктеу</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FileUploadForm;
