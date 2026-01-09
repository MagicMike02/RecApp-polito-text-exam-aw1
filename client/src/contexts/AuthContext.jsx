import { createContext, useState, useEffect, useContext } from "react";
import * as API from "../services/apiService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const user = await API.getCurrentUser();
      setUser(user);
    } catch (error) {
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const user = await API.login(username, password);
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorKey = error.key || "network_error";
      return { success: false, error: errorKey };
    }
  };

  const logout = async () => {
    try {
      await API.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
