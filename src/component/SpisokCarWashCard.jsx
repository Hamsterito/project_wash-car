import { useNavigate } from "react-router-dom";
import { useState } from "react";
import cogIcon from '../assets/qwert.svg';
import CarWashEditModal from "./CarWashEditModal";
import "./SpisokCarWashCard.css";


const SpisokCarWashCard = ({ id, name, address, image, userRole }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => navigate(`/carwash/${id}`);
  const toggleModal = (e) => {
    e.stopPropagation();
    setShowModal(!showModal);
  };

  const handleSave = (updatedData) => {
    console.log("Сохранить автомойку:", updatedData);
    setShowModal(false);
  };

  return (
    <>
      <button className="carwash-card" onClick={handleClick}>
        <div className="carwash-info">
          <h3 className="carwash-name">{name}</h3>
          <p className="carwash-address">{address}</p>
        </div>
        <img className="carwash-image" src={image} alt="Автомойка" />
        
        {userRole === 'business' && (
          <img
            src={cogIcon}
            alt="Настройки"
            className="settings-icon"
            onClick={toggleModal}
            title="Настройки"
          />
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
    </>
  );
};

export default SpisokCarWashCard;
