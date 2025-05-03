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
      
      if (clientId) {
        setIsLoading(true);
        try {
          const response = await fetch("http://localhost:5000/api/get-role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ clientId }),
          });

          const data = await response.json();
          
          if (data.success) {
            const role = data.role.toLowerCase();
            localStorage.setItem("role", role);
            setUserRole(role);
          } else {
            console.error("Failed to fetch user role:", data.error);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isLoggedIn) {
      fetchUserRole();
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