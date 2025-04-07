
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("bg-primary text-primary-foreground py-4 px-6 shadow-md", className)}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen size={24} />
          <span className="text-xl font-bold">School Info Hub</span>
        </Link>
        <nav>
          <ul className="flex space-x-3">
            <li>
              <Button variant="link" asChild>
                <Link to="/" className="text-primary-foreground hover:text-white">
                  Кесте
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="link" asChild>
                <Link to="/birthdays" className="text-primary-foreground hover:text-white">
                  Туған күндер
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="link" asChild>
                <Link to="/map" className="text-primary-foreground hover:text-white">
                  Карта
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
