import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("client_id")
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "user");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const clientId = localStorage.getItem("client_id");

      if (!clientId) return;

      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/get-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientId }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.role) {
          const role = data.role.toLowerCase();
          localStorage.setItem("role", role);
          setUserRole(role);
        } else {
             setIsLoading(false);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      const timeout = setTimeout(fetchUserRole, 200);
      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn]);

  const login = async (clientId) => {
    localStorage.setItem("client_id", clientId);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("client_id");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole("user");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        setIsLoggedIn, 
        userRole, 
        setUserRole, 
        login,
        logout,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
