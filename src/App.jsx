import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./component/Header";
import BannerSlider from "./component/BannerSlider";
import Footer from "./component/Footer";
import CitySelector from './component/CitySelector';
import CarWashGrid from './component/CarWashGrid';
import AboutUs from './component/AboutUs';
import Profil from './component/Profil'; 

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
            <Footer />
          </>
        } />
        <Route path="/profile" element={<Profil />} />
      </Routes>
    </Router>
  );
};

export default App;
