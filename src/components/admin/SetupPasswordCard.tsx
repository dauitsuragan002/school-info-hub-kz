import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function SetupPasswordCard() {
  const [password, setPassword] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Жаңа пароль генерациялау
  const generatePassword = () => {
    // Қарапайым пароль генерациясы
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let newPassword = '';
    
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setPassword(newPassword);
    setPasswordHash('');
  };

  // Хэш генерациялау
  const generateHash = async () => {
    if (!password.trim()) {
      setError('Пароль енгізіңіз немесе генерациялаңыз');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Браузерде тікелей хэш жасау (API-ді қолданбай)
      // Бұл браузерде орындалып, серверге сұраныс жібермейді
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      setPasswordHash(hashedPassword);
      toast({
        title: 'Хэш сәтті генерацияланды',
        description: 'Хэшті ADMIN_PASSWORD_HASH параметріне орнатыңыз',
      });
    } catch (err) {
      console.error('Хэшті генерациялау кезінде қате:', err);
      setError('Хэшті генерациялау кезінде қате шықты. Браузер ішінде хэш жасау функциясы қолжетімсіз болуы мүмкін.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Хэшті көшіру
  const copyHash = () => {
    if (!passwordHash) return;
    
    // Clipboard API қолжетімді ме екенін тексеру
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(passwordHash)
        .then(() => {
          toast({
            title: 'Көшірілді',
            description: 'Пароль хэші буферге көшірілді',
          });
        })
        .catch(error => {
          console.error('Clipboard error:', error);
          // Clipboard API қолжетімсіз болса, альтернативті әдісті қолдану
          fallbackCopyToClipboard();
        });
    } else {
      // Clipboard API қолжетімсіз болса, альтернативті әдісті қолдану
      fallbackCopyToClipboard();
    }
  };
  
  // Альтернативті көшіру әдісі
  const fallbackCopyToClipboard = () => {
    try {
      // Уақытша textarea элементін жасау
      const textArea = document.createElement('textarea');
      textArea.value = passwordHash;
      
      // Құжатқа қосу
      document.body.appendChild(textArea);
      
      // Мәтінді таңдау
      textArea.select();
      
      // Көшіру командасын орындау
      const successful = document.execCommand('copy');
      
      // Уақытша элементті жою
      document.body.removeChild(textArea);
      
      if (successful) {
        toast({
          title: 'Көшірілді',
          description: 'Пароль хэші буферге көшірілді',
        });
      } else {
        // Ескерту көрсету
        setError('Көшіру кезінде қате шықты. Мәтінді қолмен көшіріңіз.');
      }
    } catch (err) {
      console.error('Fallback copy error:', err);
      setError('Көшіру кезінде қате шықты. Мәтінді қолмен көшіріңіз.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Әкімші паролін орнату
        </CardTitle>
        <CardDescription>
          Қауіпсіз пароль жасаңыз және оның хэшін алыңыз. Хэшті Environment Variables ретінде сақтаңыз.
        </CardDescription>
        
        <CardDescription className="mt-2 text-amber-600 font-semibold">
          МАҢЫЗДЫ: Парольді есте сақтаңыз. Аутентификация кезінде осы ПАРОЛЬДІ енгізесіз, хэшті емес.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Қате</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {passwordHash && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Хэш дайын</AlertTitle>
            <AlertDescription className="break-all">
              <p className="mb-2">
                ADMIN_PASSWORD_HASH ретінде орнатыңыз:
              </p>
              <code className="bg-green-100 p-1 rounded">
                {passwordHash}
              </code>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={copyHash}
              >
                <Copy className="h-3 w-3 mr-1" />
                Көшіру
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              type="text"
            />
          </div>
          <Button variant="outline" onClick={generatePassword}>
            Генерациялау
          </Button>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={generateHash} 
          disabled={isGenerating || !password.trim()}
          className="w-full"
        >
          {isGenerating ? 'Жасалуда...' : 'Хэш жасау'}
        </Button>
      </CardFooter>
    </Card>
  );
} 