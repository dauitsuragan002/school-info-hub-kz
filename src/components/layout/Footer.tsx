
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("bg-secondary py-6 mt-auto", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} School Info Hub KZ. Барлық құқықтар қорғалған.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Кесте
            </Link>
            <Link to="/birthdays" className="text-sm text-muted-foreground hover:text-primary">
              Туған күндер
            </Link>
            <Link to="/map" className="text-sm text-muted-foreground hover:text-primary">
              Карта
            </Link>
            {/* Hidden admin link */}
            <Link to="/upload" className="text-sm text-transparent hover:text-transparent">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
