
import React from 'react';
import Layout from '@/components/layout/Layout';
import BirthdayList from '@/components/birthdays/BirthdayList';
import { mockStudentsData, mockTeachersData } from '@/data/mockData';

const BirthdaysPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Туған күндер</h1>
          <p className="text-muted-foreground mb-6">
            Оқушылар мен мұғалімдердің туған күндері
          </p>
        </div>
        
        <div className="space-y-8">
          <BirthdayList 
            title="Оқушылардың туған күндері" 
            data={mockStudentsData} 
            type="student" 
          />
          
          <BirthdayList 
            title="Мұғалімдердің туған күндері" 
            data={mockTeachersData} 
            type="teacher" 
          />
        </div>
      </div>
    </Layout>
  );
};

export default BirthdaysPage;
