import React from "react";
import Header from "./component/Header";
import BannerSlider from "./component/BannerSlider";
import Footer from "./component/Footer";
import CitySelector from './component/CitySelector';
import CarWashGrid from './component/CarWashGrid';
import AboutUs from './component/AboutUs';
import ContactUs from './component/ContactUs';


const App = () => {
  return (
    <div>
      <Header/>
      <BannerSlider/>
      <CitySelector />
      <CarWashGrid />
      <AboutUs />
      <ContactUs/>
      <Footer/>
    </div>
  );
};

export default App;
