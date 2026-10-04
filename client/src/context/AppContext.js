import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const savedDark = await AsyncStorage.getItem("darkMode");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      setDark(savedDark === "true");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user", "activeTimer"]);
    setUser(null);
  };

  const toggleDark = async () => {
    const next = !dark;
    setDark(next);
    await AsyncStorage.setItem("darkMode", String(next));
  };

  const refreshUser = async () => {
    const response = await API.get("/user/profile");
    await AsyncStorage.setItem("user", JSON.stringify(response.data));
    setUser(response.data);
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      dark,
      login,
      logout,
      toggleDark,
      refreshUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
