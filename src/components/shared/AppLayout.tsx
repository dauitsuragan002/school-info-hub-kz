import React from 'react';
import { NavBar } from '../NavBar';
import { Footer } from '../Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <NavBar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default AppLayout; 