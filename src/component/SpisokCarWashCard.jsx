import { useNavigate } from "react-router-dom";
import "./SpisokCarWashCard.css"

const SpisokCarWashCard = ({ id, name, address, image }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/carwash/${id}`);
  };

  return (
    <button className="carwash-card" onClick={handleClick}>
      <div className="carwash-info">
        <h3 className="carwash-name">{name}</h3>
        <p className="carwash-address">{address}</p>
      </div>
      <img className="carwash-image" src={image} alt="Автомойка" />
    </button>
  );
};

export default SpisokCarWashCard;