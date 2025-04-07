
import React from 'react';
import { Schedule } from '@/models/types';

interface ScheduleTableProps {
  scheduleData: Schedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ scheduleData }) => {
  if (scheduleData.length === 0) {
    return (
      <div className="my-8 text-center">
        <p className="text-muted-foreground">Сүзгі параметрлеріне сәйкес кесте табылмады.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table-style">
        <thead className="table-header">
          <tr>
            <th>Күн</th>
            <th>Уақыт</th>
            <th>Сынып</th>
            <th>Пән</th>
            <th>Кабинет</th>
            <th>Ауысым</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((item, index) => (
            <tr key={index} className="table-row-alt">
              <td className="table-cell">{item.day}</td>
              <td className="table-cell">{item.time}</td>
              <td className="table-cell">{item.grade}</td>
              <td className="table-cell">{item.subject}</td>
              <td className="table-cell">{item.room}</td>
              <td className="table-cell">{item.shift}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
