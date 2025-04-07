
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export const MapThumbnail = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="h-5 w-5" />
          Мектеп Картасы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-muted h-40 w-full rounded-md flex items-center justify-center">
            <p className="text-muted-foreground text-center">Мектеп картасы әзірленуде</p>
          </div>
          <Button asChild>
            <Link to="/map">Картаға өту</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
