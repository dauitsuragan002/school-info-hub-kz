
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School } from "lucide-react";

export const InstructionCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Жүктеу Нұсқаулығы
          </div>
        </CardTitle>
        <CardDescription>
          Мектеп мәліметтерін дұрыс жүктеу үшін осы қадамдарды орындаңыз
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-2">
          <li>"Үлгі Жүктеу" батырмасын басу арқылы Excel үлгі файлын жүктеңіз</li>
          <li>Үлгі форматына сәйкес мәліметтерді толтырыңыз</li>
          <li>Excel файлын сақтаңыз</li>
          <li>Жоғарыдағы жүктеу батырмасы арқылы файлды таңдаңыз</li>
          <li>"Файлдарды Жүктеу" батырмасын басып, мәліметтерді жүктеңіз</li>
          <li>Жүктелген мәліметтер төмендегі кестеде көрсетіледі</li>
        </ol>
      </CardContent>
    </Card>
  );
};
