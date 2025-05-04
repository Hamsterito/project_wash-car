import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import BannerSlider from "../component/BannerSlider";
import CitySelector from "../component/CitySelector";
import CarWashGrid from "../component/CarWashGrid";
import AboutUs from "../component/AboutUs";
import ContactUs from "../component/ContactUs";
import Footer from "../component/Footer";

const MainPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      <div id="banner">
        <BannerSlider />
      </div>
      <CitySelector />
      <div id="booking">
        <CarWashGrid />
      </div>
      <div id="about">
        <AboutUs />
      </div>
      <ContactUs />
    </>
  );
};

export default MainPage;
