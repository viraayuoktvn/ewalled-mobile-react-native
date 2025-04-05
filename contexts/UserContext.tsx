import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserResponse, WalletResponse } from "@/services/api";

// Tipe data context
interface UserContextType {
  user: UserResponse | null;
  wallet: WalletResponse | null;
  setUser: (user: UserResponse) => void;
  setWallet: (wallet: WalletResponse) => void;
}

// Props untuk Provider
interface UserProviderProps {
  children: React.ReactNode;
}

// Buat Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [wallet, setWalletState] = useState<WalletResponse | null>(null);

  // Simpan user ke context & AsyncStorage
  const setUser = async (user: UserResponse) => {
    setUserState(user);
    await AsyncStorage.setItem("userData", JSON.stringify(user));
  };

  // Simpan wallet ke context & AsyncStorage
  const setWallet = async (wallet: WalletResponse) => {
    setWalletState(wallet);
    await AsyncStorage.setItem("walletData", JSON.stringify(wallet));
  };

  // Load dari storage saat app dibuka
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

// Custom hook untuk akses context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};