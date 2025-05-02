import React, { useState } from 'react';
import ViewApplicationModal from './ViewApplicationModal'; 

const ApplicationsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  

  const applications = Array(10).fill({
    name: 'Макенбалд Чинчопа',
    phone: '+7(707)7771234',
    time: '10:00–22:00',
  });

  const visibleApps = showAll ? applications : applications.slice(0, 5);

  return (
    <div>
      <div className="applications-header">Недавние заявки:</div>
      <div className="applications-table-container">
        <h2>Заявки новых автомоек!</h2>
        <table className="applications-table">
          <thead>
            <tr>
              <th>Имя Фамилия</th>
              <th>номер</th>
              <th>время подачи заявки</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleApps.map((app, index) => (
              <tr key={index}>
                <td>{app.name}</td>
                <td>{app.phone}</td>
                <td>{app.time}</td>
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

        {!showAll && applications.length > 5 && (
          <div className="see-more">
            <button onClick={() => setShowAll(true)}>еще..</button>
          </div>
        )}
      </div>

        {selectedApp && (
            <ViewApplicationModal
                data={selectedApp}
                onClose={() => setSelectedApp(null)}
                onApprove={() => {
                console.log('Заявка одобрена');
                setSelectedApp(null);
                }}
                onReject={(invalidFields) => {
                console.log('Заявка отклонена. Ошибки:', invalidFields);
                setSelectedApp(null);
                }}
            />
        )}

    </div>
  );
};

export default ApplicationsSection;
