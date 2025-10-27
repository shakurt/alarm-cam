/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { UserInfo } from "@/types";

type UserContextType = {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem("user-info");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem("user-info", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("user-info");
    }
  }, [userInfo]);

  const logout = () => {
    setUserInfo(null);
  };

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
