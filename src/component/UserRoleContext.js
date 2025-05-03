import { createContext, useContext } from "react";

export const UserRoleContext = createContext('user');

export const useUserRole = () => useContext(UserRoleContext);
