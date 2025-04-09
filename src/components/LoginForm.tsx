import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Қате",
        description: "Құпия сөзді енгізіңіз",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Trying to log in with password');
    const success = await login(password);
    console.log('Login result:', success);
    
    if (success) {
      // Сәтті хабарлама көрсету
      setSuccessMessage('Сәтті кіру! Әкімшілік панеліне кіргізу...');
      
      // Тост хабарлама көрсету
      toast({
        title: "Сәтті кіру",
        description: "Әкімшіліk панеліне кіргізілдіңіз",
      });
      
      // Бет жаңартылатын уақыт
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        // Бетті қайта жүктеу
        window.location.href = "/admin";
      }, 1500);
    } else if (error) {
      toast({
        title: "Кіру қатесі",
        description: error || "Жүйеге кіру кезінде қате орын алды",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Жеке профильге кіру</CardTitle>
        <CardDescription>
          Жалғастыру үшін әкімшіліk құпия сөзді енгізіңіз
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Құпия сөз"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading || successMessage !== null}
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !password.trim() || successMessage !== null}
          >
            {isLoading ? 'Кіру...' : 'Кіру'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 