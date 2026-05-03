import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: localStorage.getItem("token") || null,
    rol: localStorage.getItem("rol") || null,
    id: localStorage.getItem("id") || null,
    name: localStorage.getItem("name") || null,
    cambio_pass: localStorage.getItem("cambio_pass") || null,
  });

  const loginUser = (token, rol, id, name, cambio_pass) => {
    localStorage.setItem("token", token);
    localStorage.setItem("rol", rol);
    localStorage.setItem("id", id);
    localStorage.setItem("name", name);
    localStorage.setItem("cambio_pass", cambio_pass);
    setUser({ token, rol, id, name, cambio_pass });
  };

  const logoutUser = () => {
    localStorage.clear();
    setUser({ token: null, rol: null, id: null, name: null, cambio_pass: null });
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
