import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

interface AdminLoginFormProps {
  onLogin: (success: boolean) => void;
}

export const AdminLoginForm = ({ onLogin }: AdminLoginFormProps) => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    // Әкімшілік паролін тексеру
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      toast({
        title: "Сәтті кіру",
        description: "Әкімшілік панеліне қош келдіңіз",
      });
      onLogin(true);
      // Кіру сәтті болған соң локал сторажға сақтау
      localStorage.setItem("isAdminLoggedIn", "true");
    } else {
      toast({
        title: "Қате пароль",
        description: "Дұрыс пароль енгізіңіз",
        variant: "destructive",
      });
      onLogin(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Әкімшілік кіру
        </CardTitle>
        <CardDescription>
          Әкімшілік панеліне кіру үшін парольді енгізіңіз
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Пароль енгізіңіз"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogin} className="w-full">
          Кіру
        </Button>
      </CardFooter>
    </Card>
  );
}; 