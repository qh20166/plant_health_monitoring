import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode
  } from "react";
  
  interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
  }
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
    useEffect(() => {
      const storedLoggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(storedLoggedInStatus);
    }, []);
  
    const login = () => {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true"); 
    };
  
    const logout = () => {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false"); 
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("UserID");
      localStorage.removeItem("Username");
    };
  
    return (
      <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
  