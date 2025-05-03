import React, { useState } from "react";
import SpisokCarWashCard from "../component/SpisokCarWashCard";
import CarWashEditModal from "../component/CarWashEditModal";
import carwash from '../assets/carwash.png';
import { useAuth } from "../component/AuthContext";

const ListCarWashes = () => {
  const { userRole } = useAuth();
  console.log(userRole);
  const [carWashData, setCarWashData] = useState([
    {
      id: 1,
      name: "Автомойка 1",
      address: "ул. Примерная, 1",
      image: carwash,
    },
    {
      id: 2,
      name: "Автомойка 2",
      address: "ул. Моечная, 2",
      image: carwash,
    },
    {
      id: 3,
      name: "Автомойка 3",
      address: "ул. Чистая, 3",
      image: carwash,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCarWash = (newCarWash) => {
    const newId = carWashData.length + 1;
    setCarWashData([...carWashData, { ...newCarWash, id: newId }]);
    setShowCreateModal(false);
  };

  return (
    <div>
      {userRole === "business" && (
        <button 
          style={{
            display: 'block',
            margin: '20px auto',
            padding: '12px 24px',
            backgroundColor: '#ffb800',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={() => setShowCreateModal(true)}
        >
          Создать автомойку
        </button>
      )}



      {carWashData.map((wash) => (
        <SpisokCarWashCard
          key={wash.id}
          id={wash.id}
          name={wash.name}
          address={wash.address}
          image={wash.image}
          userRole={userRole}
        />
      ))}

      {showCreateModal && (
        <CarWashEditModal
          data={{
            id: null,
            name: "",
            address: "",
            image: carwash,
            schedule: "",
            slots: 1,
            managers: [],
            services: [],
          }}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCarWash}
          isCreating={true}
        />
      )}
    </div>
  );
};

export default ListCarWashes;
