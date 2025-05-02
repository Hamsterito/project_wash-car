import React, { useState } from 'react';
import ViewApplicationDetailsModal from './ViewApplicationDetailsModal';

const HistoryApplicationsSection = () => {
  const [selectedApp, setSelectedApp] = useState(null);

  const applicationHistory = [
    {
      name: 'Какой то чел 1',
      phone: '+7(707)7771234',
      time: '20.03 12:00',
      status: 'Принят',
    },
    {
      name: 'Теперь чел 2',
      phone: '+7(707)7771234',
      time: '21.03 10:30',
      status: 'Отклонен',
    },
    {
      name: 'Просто 3',
      phone: '+7(707)7771234',
      time: '22.03 14:15',
      status: 'Принят',
    },
  ];

  return (
    <div className='razdelenie'>
      <div className="applications-header">История заявок:</div>
      <div className="applications-table-container">
        <h2>Проверенные заявки автомоек</h2>
        <table className="applications-table">
          <thead>
            <tr>
              <th>Имя Фамилия</th>
              <th>Номер</th>
              <th>Время подачи</th>
              <th>Был</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applicationHistory.map((app, index) => (
              <tr key={index}>
                <td>{app.name}</td>
                <td>{app.phone}</td>
                <td>{app.time}</td>
                <td>{app.status}</td>
                <td>
                  <a
                    href="#"
                    className="view-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedApp(app);
                    }}
                  >
                    Смотреть данные
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <ViewApplicationDetailsModal
          data={selectedApp}
          onClose={() => setSelectedApp(null)}
          onApprove={() => {
            console.log('Просмотр завершен');
            setSelectedApp(null);
          }}
          onReject={() => {
            console.log('Просмотр завершен');
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
};

export default HistoryApplicationsSection;


