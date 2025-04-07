
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";

interface BirthdayPerson {
  id: number;
  name: string;
  grade?: string;
  subject?: string;
  birthDate: string;
}

interface BirthdaySectionProps {
  title: string;
  data: BirthdayPerson[];
  type: "student" | "teacher";
}

export const BirthdaySection = ({ title, data, type }: BirthdaySectionProps) => {
  // Sort birthdays by date (closest first)
  const sortedBirthdays = [...data].sort((a, b) => {
    const dateA = parseISO(a.birthDate);
    const dateB = parseISO(b.birthDate);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gift className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedBirthdays.length > 0 ? (
          <ul className="space-y-3">
            {sortedBirthdays.map((person) => (
              <li 
                key={person.id} 
                className="flex justify-between p-3 rounded-md border hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {type === "student" ? person.grade : person.subject}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {format(parseISO(person.birthDate), "dd.MM.yyyy")}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Туған күндер туралы ақпарат жоқ
          </div>
        )}
      </CardContent>
    </Card>
  );
};
