import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({ user: null, updateUser: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const updateUser = (newUser) => setUser(newUser);
  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 