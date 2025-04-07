
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";

const MapPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Артқа қайту
          </Link>
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Мектеп Картасы
        </h1>
      </div>

      <div className="bg-muted rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <MapPin className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-2xl font-semibold mb-2">Мектеп картасы әзірленуде</h2>
        <p className="text-muted-foreground max-w-md">
          Бұл бет әзірлену үстінде. Жақын арада мектептің толық интерактивті картасы қол жетімді болады.
        </p>
      </div>
    </div>
  );
};

export default MapPage;
