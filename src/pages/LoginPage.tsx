import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = () => {
    // Әкімшіліk паролін тексеру
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      login();
      toast({
        title: "Сәтті кіру",
        description: "Әкімшіліk панеліне қош келдіңіз",
      });
      navigate("/admin");
    } else {
      toast({
        title: "Қате пароль",
        description: "Дұрыс пароль енгізіңіз",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Әкімшіліk кіру
          </CardTitle>
          <CardDescription>
            Әкімшіліk панеліне кіру үшін парольді енгізіңіз
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
            <Button onClick={handleLogin} className="w-full">
              Кіру
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 