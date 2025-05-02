import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./component/Header";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import ListCarWashes from "./pages/ListCarWashes"
import CarWashSchedule from "./pages/CarWashSchedule";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/list-car-washes" element={<ListCarWashes />} />
        <Route path="/carwash/:id" element={<CarWashSchedule />} />
      </Routes>
    </Router>
  );
};

export default App;
