import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminNavProps {
  title?: string;
}

export function AdminNav({ title = 'Әкімшілік панель' }: AdminNavProps) {
  const { logout, isLoading } = useAuth();
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const handleShowConfirmation = () => {
    setShowConfirmation(true);
    setSheetOpen(false);
  };
  
  const handleLogout = async () => {
    setShowConfirmation(false);
    
    toast({
      title: "Жүйеден шығу",
      description: "Жүйеден шығу орындалуда...",
    });
    
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Қате",
        description: "Жүйеден шығу кезінде қате орын алды",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="hidden sm:inline font-semibold text-gray-800">{title}</span>
                <span className="sm:hidden font-semibold text-gray-800">Әкімші</span>
              </div>
            </div>
            
            {/* Десктоп меню - үлкен экрандарда */}
            <div className="hidden sm:flex items-center space-x-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShowConfirmation}
                disabled={isLoading}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Шығу
              </Button>
            </div>
            
            {/* Мобильді меню - кішкентай экрандарда */}
            <div className="sm:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] border-l border-gray-100 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <h2 className="text-lg font-semibold mb-2">{title}</h2>
                      <p className="text-sm text-gray-500">Басқару панелі</p>
                    </div>
                    
                    <div className="p-6 border-t mt-auto">
                      <Button 
                        className="w-full justify-center bg-red-500 hover:bg-red-600 text-white" 
                        size="lg"
                        onClick={handleShowConfirmation}
                        disabled={isLoading}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Жүйеден шығу
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px] rounded-xl p-0 overflow-hidden">
          <div className="bg-red-50 p-6">
            <DialogHeader>
              <DialogTitle className="text-red-700 text-xl">Жүйеден шығу</DialogTitle>
              <DialogDescription className="text-red-700/80">
                Жүйеден шығуды растаңыз. Сіз өз профиліңізден шығасыз.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <DialogFooter className="p-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
              Бас тарту
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              disabled={isLoading} 
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Шығу..." : "Шығу"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 