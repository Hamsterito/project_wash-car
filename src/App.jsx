import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./component/Header";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import ListCarWashes from "./pages/ListCarWashes";
import CarWashSchedule from "./pages/CarWashSchedule";
import { UserRoleContext } from "./component/UserRoleContext";
import Footer from "./component/Footer";

const App = () => {
  const userRole = 'user';

  return (
    <UserRoleContext.Provider value={userRole}>
      <div className="app-wrapper">
        <Router>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/list-car-washes" element={<ListCarWashes />} />
              <Route path="/carwash/:id" element={<CarWashSchedule />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </div>
    </UserRoleContext.Provider>
  );
};

export default App;
