import { useNavigate } from "react-router-dom";
import { useState } from "react";
import cogIcon from "../assets/qwert.svg";
import CarWashEditModal from "./CarWashEditModal";
import "./SpisokCarWashCard.css";
import { Trash2 } from "lucide-react";

const SpisokCarWashCard = ({
  id,
  name,
  address,
  image,
  userRole,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleClick = () => navigate(`/carwash/${id}`);

  const toggleModal = (e) => {
    e.stopPropagation();
    setShowModal(!showModal);
  };

  const toggleDeleteConfirm = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(!showDeleteConfirm);
  };

  const handleSave = (updatedData) => {
    console.log("Сохранить автомойку:", updatedData);
    setShowModal(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    try {
      const response = await fetch(`http://localhost:5000/api/carwash-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.success) {
        if (onDelete) onDelete(id);
        setShowDeleteConfirm(false);
      } else {
        console.error(data.error || "Ошибка при удалении автомойки");
      }
    } catch (error) {
      console.error("Error deleting car wash:", error);
    }
  };

  return (
    <>
      <button className="carwash-card" onClick={handleClick}>
        <div className="carwash-info">
          <h3 className="carwash-name">{name}</h3>
          <p className="carwash-address">{address}</p>
        </div>
        <img className="carwash-image" src={image} alt="Автомойка" />

        {userRole === "business" && (
          <div className="carwash-actions">
            <img
              src={cogIcon}
              alt="Настройки"
              className="settings-icon"
              onClick={toggleModal}
              title="Настройки"
            />
            <Trash2
              className="delete-icon"
              onClick={toggleDeleteConfirm}
              title="Удалить"
              size={24}
              color="#d32f2f"
            />
          </div>
        )}
      </button>

      {showModal && (
        <CarWashEditModal
          data={{
            id,
            name,
            address,
            image,
            schedule: "",
            slots: 1,
            managers: [],
            services: [],
          }}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop" onClick={toggleDeleteConfirm}></div>
          <div className="carwash-modal delete-confirm-modal">
            <h3>Удаление автомойки</h3>
            <p>Вы уверены, что хотите удалить автомойку "{name}"?</p>
            <p className="warning-text">Это действие невозможно отменить.</p>
            <div className="carwash-modal-actions">
              <button className="secondary" onClick={toggleDeleteConfirm}>
                Отмена
              </button>
              <button className="delete-button" onClick={handleDelete}>
                Удалить
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SpisokCarWashCard;
