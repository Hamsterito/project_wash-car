import React from "react";
import Header from "./component/Header";
import BannerSlider from "./component/BannerSlider";
import Footer from "./component/Footer";
import CitySelector from './component/CitySelector';
import CarWashGrid from './component/CarWashGrid';


const App = () => {
  return (
    <div>
      <Header/>
      <BannerSlider/>
      <CitySelector />
      <CarWashGrid />
      <Footer/>
    </div>
  );
};

export default App;
