import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [loginTime, setLoginTime] = useState(null);

  // Load user & loginTime from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const userData = await AsyncStorage.getItem('user');
        const loginTimeData = await AsyncStorage.getItem('loginTime');
        if (userData) {
          setUser(JSON.parse(userData));
        }
        if (loginTimeData) {
          setLoginTime(loginTimeData);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

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
      const now = new Date().toLocaleString();
      setLoginTime(now);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('loginTime', now);
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
      // Set loginTime giống như login
      const now = new Date().toLocaleString();
      setLoginTime(now);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('loginTime', now);
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

  const logout = async () => {
    setUser(null);
    setLoginTime(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('loginTime');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginTime,
        setUser
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
