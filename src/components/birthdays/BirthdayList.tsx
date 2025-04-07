
import React from 'react';
import { Student, Teacher } from '@/models/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface BirthdayListProps {
  title: string;
  data: (Student | Teacher)[];
  type: 'student' | 'teacher';
}

const BirthdayList: React.FC<BirthdayListProps> = ({ title, data, type }) => {
  // Format birthdate to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('kk-KZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Жазбалар табылмады</p>
        ) : (
          <ul className="divide-y">
            {data.map((person, index) => (
              <li key={index} className="py-3 flex flex-col sm:flex-row sm:justify-between">
                <div className="font-medium">{person.name}</div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {type === 'student' ? (
                    <span>Сынып: {(person as Student).grade}</span>
                  ) : (
                    <span>Лауазым: {(person as Teacher).position}</span>
                  )}
                  <span>Туған күні: {formatDate(person.birthdate)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdayList;
