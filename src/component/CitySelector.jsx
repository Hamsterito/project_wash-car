
import React, { useState } from 'react';
import './CitySelector.css';

const CitySelector = () => {
  const [selectedCity, setSelectedCity] = useState('Астана');
  const [showDropdown, setShowDropdown] = useState(false);

  const cities = ['Астана', 'Алматы', 'Экибастуз', 'Варшава'];

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowDropdown(false);
  };

  return (
    <div className="city-selector-container">
      <span className="city-label">Выберете город в котором находитесь:</span>
      <div className="city-dropdown">
        <button className="city-button" onClick={toggleDropdown}>
          {selectedCity}
          <span className="arrow">&#9662;</span>
        </button>
        {showDropdown && (
          <ul className="city-list">
            {cities.map((city) => (
              <li key={city} onClick={() => handleCitySelect(city)}>
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CitySelector;
