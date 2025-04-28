import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./component/Header";
import BannerSlider from "./component/BannerSlider";
import Footer from "./component/Footer";
import CitySelector from './component/CitySelector';
import CarWashGrid from './component/CarWashGrid';
import AboutUs from './component/AboutUs';
import ContactUs from './component/ContactUs';
import ProfilePage from './component/ProfilePage'; 

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
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
