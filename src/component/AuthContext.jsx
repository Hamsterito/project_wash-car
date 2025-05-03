import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("client_id")
  );

  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "user");

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
