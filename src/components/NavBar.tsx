import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Building, MapPin, Cake, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <Link to="/" className="font-bold text-xl">Мектеп Кестесі</Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Link to="/map" className="text-sm font-medium hover:text-primary transition-colors">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Мектеп картасы</span>
            </div>
          </Link>
          <Link to="/birthdays" className="text-sm font-medium hover:text-primary transition-colors">
            <div className="flex items-center gap-1">
              <Cake className="h-4 w-4" />
              <span>Туған күндер</span>
            </div>
          </Link>
          
          {isAuthenticated ? (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="ml-4">
                <Settings className="h-4 w-4 mr-2" />
                Әкімшілік
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="ml-4">
                <Settings className="h-4 w-4 mr-2" />
                Кіру
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
} 