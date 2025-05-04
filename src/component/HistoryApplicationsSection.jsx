import React, { useState, useEffect } from 'react';
import ViewApplicationDetailsModal from './ViewApplicationDetailsModal';

const HistoryApplicationsSection = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    async function fetchVerifiedApplications() {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/verified-business-accounts");
        const data = await response.json();

        setTimeout(() => { // Искусственная задержка
          if (data.success) {
            setApplications(data.data);
          } else {
            console.error("Ошибка при загрузке проверенных заявок:", data.error);
          }
          setLoading(false);
        }, 500); // Задержка в 500 мс
      } catch (error) {
        console.error("Ошибка при загрузке проверенных заявок:", error);
        setLoading(false);
      }
    }

    fetchVerifiedApplications();
  }, []);

  return (
    <div className="razделение">
      <div className="applications-header">История заявок:</div>
      <div className="applications-table-container">
        <h2>Проверенные заявки автомоек</h2>
        {loading ? (
          <div className="loading-indicator">Загрузка...</div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Имя Фамилия</th>
                <th>Контакт</th>
                <th>Адрес</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.client_name}</td>
                  <td>{app.contact_info}</td>
                  <td>{app.address}</td>
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
        )}
      </div>

      {selectedApp && (
        <ViewApplicationDetailsModal
          data={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default HistoryApplicationsSection;


