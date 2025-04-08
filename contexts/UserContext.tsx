import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserResponse, WalletResponse } from "@/services/api";

interface UserContextType {
  user: UserResponse | null;
  wallet: WalletResponse | null;
  setUser: (user: UserResponse) => void;
  setWallet: (wallet: WalletResponse) => void;
}

interface UserProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [wallet, setWalletState] = useState<WalletResponse | null>(null);

  const setUser = async (user: UserResponse) => {
    setUserState(user);
    await AsyncStorage.setItem("userData", JSON.stringify(user));
  };

  const setWallet = async (wallet: WalletResponse) => {
    setWalletState(wallet);
    await AsyncStorage.setItem("walletData", JSON.stringify(wallet));
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        const storedWallet = await AsyncStorage.getItem("walletData");

        if (storedUser) setUserState(JSON.parse(storedUser));
        if (storedWallet) setWalletState(JSON.parse(storedWallet));
      } catch (error) {
        console.error("Failed to load user/wallet from storage:", error);
      }
    };

    loadStoredData();
  }, []);

  return (
    <UserContext.Provider value={{ user, wallet, setUser, setWallet }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};