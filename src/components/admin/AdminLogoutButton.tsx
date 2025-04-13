import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AdminLogoutButtonProps {
  onLogout: () => void;
}

export const AdminLogoutButton = ({ onLogout }: AdminLogoutButtonProps) => {
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    onLogout();
    toast({
      title: "Шығу сәтті орындалды",
      description: "Әкімшілік панелінен шықтыңыз",
    });
  };

  return (
    <Button variant="outline" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      Шығу
    </Button>
  );
}; 