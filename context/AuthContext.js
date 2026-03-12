import React, { createContext, useContext, useState } from "react";
import * as authService from "../services/authService";

/*
========================
CREATE CONTEXT
========================
*/

const AuthContext = createContext();

/*
========================
AUTH PROVIDER
========================
*/

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /*
  ========================
  LOGIN
  ========================
  */

  const login = async (email, password) => {
    try {
      setLoading(true);

      const data = await authService.login(email, password);

      setUser(data);

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================
  REGISTER
  ========================
  */

  const register = async (userData) => {
    try {
      setLoading(true);

      const data = await authService.register(userData);

      setUser(data);

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================
  LOGOUT
  ========================
  */

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/*
========================
CUSTOM HOOK
========================
*/

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
