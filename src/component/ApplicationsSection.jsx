import React, { useState, useEffect } from 'react';
import ViewApplicationModal from './ViewApplicationModal';

const ApplicationsSection = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmReject, setConfirmReject] = useState(null); // состояние для подтверждения отклонения

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/business-requests");
      const data = await response.json();

      setTimeout(() => {
        if (data.success) {
          setApplications(data.data);
        } else {
          console.error("Ошибка при загрузке заявок:", data.error);
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Ошибка при загрузке заявок:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/update-request-status/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedApp(null);
        setConfirmReject(null);
        window.location.reload();
      } else {
        console.error(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error(`Ошибка при обновлении статуса заявки: ${error}`);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка заявок...</div>;
  }

  return (
    <div className="razdelenie">
      <div className="applications-header">Недавние заявки:</div>
      <div className="applications-table-container">
        <h2>Заявки новых автомоек!</h2>
        <table className="applications-table">
          <thead>
            <tr>
              <th>Имя Фамилия</th>
              <th>Контакт</th>
              <th>Время подачи заявки</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={index}>
                <td>{app.client_name}</td>
                <td>{app.contact_info}</td>
                <td>{new Date(app.created_at).toLocaleString()}</td>
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
        <ViewApplicationModal
          data={selectedApp}
          onClose={() => setSelectedApp(null)}
          onApprove={(requestId) => handleUpdateStatus(requestId, "Принят")}
          onReject={(requestId) => setConfirmReject(requestId)}
        />
      )}

      {confirmReject && (
        <div className="login-prompt-overlay">
          <div className="login-prompt">
            <p>Вы уверены, что хотите отклонить эту заявку?</p>
            <div className="modal-buttons">
              <button className="btn-red" onClick={() => handleUpdateStatus(confirmReject, "Отклонен")}>
                Да
              </button>
              <button className="btn-green" onClick={() => setConfirmReject(null)}>
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsSection;
