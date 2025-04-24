import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from "./component/Header";
import BannerSlider from "./component/BannerSlider";
import Footer from "./component/Footer";
import CitySelector from './component/CitySelector';
import CarWashGrid from './component/CarWashGrid';
import Account from './component/Account';

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
          </>
        } />
        <Route path="/account" element={<Account />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
