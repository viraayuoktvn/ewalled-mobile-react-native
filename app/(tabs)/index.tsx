import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { ApiResponse, UserResponse, WalletResponse } from "@/services/api";
import { getImage } from "@/utils/getImage";
import { useFocusEffect } from "@react-navigation/native";


const Dashboard: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  const transactions = [
    { name: "Adityo Gizwanda", type: "Transfer", amount: "- 75.000,00" },
    { name: "Adityo Gizwanda", type: "Topup", amount: "+ 75.000,00" },
    { name: "Adityo Gizwanda", type: "Transfer", amount: "- 75.000,00" },
    { name: "Adityo Gizwanda", type: "Transfer", amount: "- 75.000,00" },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchUserAndWallet = async () => {
        try {
          setIsLoading(true);
          const token = await AsyncStorage.getItem("authToken");
          if (!token) throw new Error("No token found");
  
          console.log("🔑 Token Found:", token);
  
          // Fetch user
          const userResponse = await api.get<ApiResponse<UserResponse>>("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = userResponse.data.data;
          setUserData(user);
          console.log("✅ User Data:", user);
  
          // Fetch wallet
          const walletResponse = await api.get<ApiResponse<WalletResponse[]>>(`/api/wallets/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const wallets = Array.isArray(walletResponse.data) ? walletResponse.data : [];
  
          console.log("🔎 Wallet Response:", wallets);
  
          const userWallet = wallets.find(wallet => wallet.user.id === user.id);
  
          if (userWallet) {
            setWalletData(userWallet);
            console.log("💰 Wallet Data:", userWallet);
          } else {
            console.warn("⚠️ No wallet found for user ID:", user.id);
          }
        } catch (error: any) {
          console.error("🚨 Error Fetching Data:", error.message);
          Alert.alert("Error", "Unable to fetch user or wallet data.");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchUserAndWallet();
    }, [])
  );  

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-4`}>
      {/* Profile & Theme Toggle */}
      <View className="mt-10 flex-row justify-between items-center">
        <View className="flex-row items-center">
        <Image
          source={
            userData?.avatarUrl
              ? { uri: userData.avatarUrl }
              : getImage("avatar.png")
          }
          className="w-12 h-12 rounded-full border-4 border-[#178F8D] mr-2"
        />
          <View>
            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg`}>
            {userData?.fullname || "Loading..."}
            </Text>
            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
              Personal Account
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleTheme}>
          <Image
            source={
              isDarkMode
                ? require("../../public/images/moon.png")
                : require("../../public/images/sun2.png")
            }
            style={{ width: 55, height: 55 }}
          />
        </TouchableOpacity>
      </View>

      {/* Greeting Section */}
      <View className="mt-6 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className={`${isDarkMode ? "text-white" : "text-black"} text-xl font-bold`}>
            Good {getGreeting()}, {userData?.fullname ? userData.fullname.split(" ")[0] : "User"}
          </Text>
          <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
            Check all your incoming and outgoing transactions here
          </Text>
        </View>
        <Image
          source={
            isDarkMode
              ? require("../../public/images/moon-face.png")
              : require("../../public/images/sun-face.png")
          }
          className="h-13 w-auto"
        />
      </View>

      {/* Account Number */}
      <View className="mt-4 bg-[#0061FF] p-4 rounded-[10px] flex-row justify-between items-center shadow-md shadow-[#19918F]">
        <Text className="text-white">Account No.</Text>
        <Text className="text-white font-bold text-lg">{walletData?.accountNumber || "Loading..."}</Text>
      </View>

      {/* Balance Section */}
      <View
        className={`mt-4 p-4 ${isDarkMode ? "bg-[#272727]" : "bg-white"} rounded-2xl flex-row justify-between items-center`}
      >
        <View>
          <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Balance</Text>
          <View className="flex-row items-center">
            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-2xl font-bold`}>
              {isBalanceHidden ? "***************" : `Rp ${walletData?.balance.toLocaleString() || "Loading..."}`}
            </Text>
            <TouchableOpacity onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
              <Image source={require("../../public/images/view.png")} className="ml-3" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex items-end">
          {/* Tombol Top Up */}
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-[10px] mb-3 shadow-md shadow-[#19918F]"
            onPress={() => router.push("/topup")}
          >
            <Image source={require("../../public/images/plus.png")} className="w-7 h-7" />
          </TouchableOpacity>

          {/*  Tombol Transfer */}
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-[10px] shadow-md shadow-[#19918F]"
            onPress={() => router.push("/transfer")}
          >
            <Image source={require("../../public/images/share.png")} className="w-7 h-7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History */}
      <View
        className={`mt-4 p-4 ${isDarkMode ? "bg-[#272727]" : "bg-white"} rounded-lg`}
      >
        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold mb-4`}>
          Transaction History
        </Text>
        <View className="h-[1px] bg-gray-300 w-full mb-3" />
        {transactions.map((item, i) => (
          <View
            key={i}
            className="flex-row justify-between items-center border-b border-gray-300 py-3"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
              <View>
                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                  {item.name}
                </Text>
                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
                  {item.type}
                </Text>
                <Text className="text-gray-500 text-xs">08 December 2024</Text>
              </View>
            </View>
            <Text
              className={`${
                item.amount.startsWith("-")
                  ? isDarkMode
                    ? "text-white"
                    : "text-black"
                  : "text-green-500"
              } font-bold`}
            >
              {item.amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Dashboard;