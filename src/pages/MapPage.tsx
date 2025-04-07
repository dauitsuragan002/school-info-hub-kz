
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const MapPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="bg-amber-50 p-6 rounded-lg flex items-center justify-center gap-4 mb-8">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <div>
            <h2 className="text-xl font-bold text-amber-700">Әзірленуде</h2>
            <p className="text-amber-600">
              Мектеп картасы жақында қол жетімді болады. Аз күтіңіз!
            </p>
          </div>
        </div>
        
        <div className="border-4 border-muted border-dashed rounded-lg w-full max-w-3xl aspect-[4/3] flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Мектеп картасы</h2>
            <p className="text-muted-foreground mb-8">
              Бұл функция әлі іске қосылмаған. Мектеп ғимаратының интерактивті картасы жақын арада жасалады.
            </p>
            <Button asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Негізгі бетке оралу</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapPage;
