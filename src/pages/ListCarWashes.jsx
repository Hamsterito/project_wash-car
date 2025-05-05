import React, { useState, useEffect } from "react";
import SpisokCarWashCard from "../component/SpisokCarWashCard";
import CarWashEditModal from "../component/CarWashEditModal";
import carwash from "../assets/carwash.png";
import { useAuth } from "../component/AuthContext";

const ListCarWashes = () => {
  const { userRole } = useAuth();
  const [carWashData, setCarWashData] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    const fetchCarWashes = async () => {
      const clientId = localStorage.getItem("client_id");
      const role = localStorage.getItem("role");

      try {
        const response = await fetch(
          `http://localhost:5000/api/carwashes?client_id=${clientId}&role=${role}`
        );
        const data = await response.json();

        if (!Array.isArray(data)) {
          setCarWashData([]);
        } else {
          setCarWashData(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки автомоек:", error);
        setCarWashData([]);
      }
    };

    fetchCarWashes();
  }, []);

  const handleCreateCarWash = (newCarWash) => {
    const newId = carWashData.length + 1;
    setCarWashData([...carWashData, { ...newCarWash, id: newId }]);
    setShowCreateModal(false);
  };

  const fetchBookings = async (boxId) => {
    const response = await fetch(
      `http://localhost:5000/api/bookings/box/${boxId}`
    );
    const data = await response.json();
    setBookings((prev) => ({ ...prev, [boxId]: data }));
  };

  return (
    <div>
      <div className="list_btn_carwash">
        <h1 className="text_list_carwash">Списки Автомойк</h1>
        {userRole === "business" && (
          <button
            className="view-toggle-button"
            id="create_carwash"
            onClick={() => setShowCreateModal(true)}
          >
            Создать автомойку
          </button>
        )}
      </div>

      {carWashData.map((wash) => (
        <SpisokCarWashCard
          key={wash.id}
          id={wash.id}
          name={wash.name}
          address={wash.address}
          image={wash.image}
          userRole={userRole}
          onFetchBookings={fetchBookings}
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
