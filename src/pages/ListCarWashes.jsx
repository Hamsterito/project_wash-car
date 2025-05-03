import React from "react";
import SpisokCarWashCard from "../component/SpisokCarWashCard";
import carwash from '../assets/carwash.png'
import { useAuth } from "../component/AuthContext";

const ListCarWashes = () => {
  const { userRole } = useAuth(); 

  const carWashData = [
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
  ];

  return (
    <div>
      {carWashData.map((wash) => (
        <SpisokCarWashCard
          key={wash.id}
          id={wash.id}
          name={wash.name}
          address={wash.address}
          image={wash.image}
          userRole="business"
        />
      ))}
    </div>
  );
};

export default ListCarWashes;