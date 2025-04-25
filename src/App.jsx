import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./component/Header";
import BannerSlider from "./component/BannerSlider";
import Footer from "./component/Footer";
import CitySelector from './component/CitySelector';
import CarWashGrid from './component/CarWashGrid';
import AboutUs from './component/AboutUs';
import Profil from './component/Profil'; 
import ContactUs from "./component/ContactUs";
import ListBooking from "./component/ListBooking"; 
import CarWashesList from "./component/CarWashesList";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <BannerSlider />
            <CitySelector />
            <CarWashGrid />
            <AboutUs />
            <ContactUs />
            <Footer />
          </>
        } />
        <Route path="/list-booking" element={<ListBooking />} /> 
        <Route path="/profile" element={<Profil />} />
        <Route path="/car-washes-list" element={<CarWashesList />} />
      </Routes>
    </Router>
  );
};

export default App;
