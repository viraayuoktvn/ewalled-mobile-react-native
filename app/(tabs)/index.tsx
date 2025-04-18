import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { ApiPaginatedResponse, ApiResponse, TransactionResponse, UserResponse, WalletResponse } from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

const Dashboard: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  // Get data user and wallet
  useFocusEffect(
    useCallback(() => {
      const fetchUserAndWallet = async () => {
        try {
          setIsLoading(true);
          const token = await AsyncStorage.getItem("authToken");
          if (!token) throw new Error("No token found");

          const userResponse = await api.get<ApiResponse<UserResponse>>("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = userResponse.data.data;
          setUserData(user);

          const walletResponse = await api.get<ApiResponse<WalletResponse[]>>(`/api/wallets/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const wallets = Array.isArray(walletResponse.data.data) ? walletResponse.data.data : [];
          const userWallet = wallets.find(wallet => wallet.user.id === user.id);

          if (userWallet) {
            setWalletData(userWallet);
          } else {
            throw new Error("No wallet found for user ID.");
          }
        } catch (error: any) {
          console.error("🚨 Error Fetching Data:", error.message);
          setModalMessage("Unable to fetch user or wallet data.");
          setModalVisible(true);  // Show modal for error
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserAndWallet();
    }, [])
  );

  // Get recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!walletData) return;

      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        const response = await api.get<ApiPaginatedResponse<TransactionResponse[]>>(
          "/api/transactions/filter",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { walletId: walletData.id },
          }
        );

        const allTx = response.data.data.content || [];
        const sortedTx = allTx.sort((a: TransactionResponse, b: TransactionResponse) => b.id - a.id);
        setRecentTransactions(sortedTx.slice(0, 4));
      } catch (err) {
        console.error("🚨 Error fetching recent transactions:", err);
      }
    };

    fetchRecentTransactions();
  }, [walletData]);

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-6`}>
      {/* Modal for error message */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: 300 }}>
            <Text>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10, padding: 10, backgroundColor: "#0061FF", alignItems: "center", borderRadius: 5 }}>
              <Text style={{ color: "white" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile user */}
      <View className="mt-7 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Image
            id="img-avatar-user"
            source={userData?.avatarUrl ? { uri: userData.avatarUrl } : require("../../public/images/default-avatar.png")}
            className="w-12 h-12 rounded-full border-4 border-[#178F8D] mr-2"
          />
          <View>
            <Text id="text-fullname" className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg`}>
              {userData?.fullname || "Loading..."}
            </Text>
            <Text id="text-account" className={`${isDarkMode ? "text-white" : "text-black"}`}>
              Personal Account
            </Text>
          </View>
        </View>
        {/* Dark or light mode */}
        <TouchableOpacity onPress={toggleTheme}>
          <Feather
            id="btn-toggle-theme"
            name={isDarkMode ? "moon" : "sun"}
            size={30}
            color={isDarkMode ? "white" : "orange"}
          />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View className="mt-6 flex-row justify-between items-center">
        <View className="flex-1">
          <Text id="text-greeting" className={`${isDarkMode ? "text-white" : "text-black"} text-2xl font-bold`}>
            Good {getGreeting()}, {userData?.fullname ? userData.fullname.split(" ")[0] : "User"}
          </Text>
          <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
            Check all your incoming and outgoing transactions here
          </Text>
        </View>
        <Image
          id="img-theme"
          source={
            isDarkMode
              ? require("../../public/images/moon-face.png")
              : require("../../public/images/sun-face.png")
          }
          className="h-13 w-auto"
        />
      </View>

      {/* Account Info */}
      <View className="mt-4 bg-[#0061FF] p-4 rounded-[10px] flex-row justify-between items-center shadow-md shadow-[#19918F]">
        <Text className="text-white">Account No.</Text>
        <Text id="text-account-number" className="text-white font-bold text-lg">{walletData?.accountNumber || "Loading..."}</Text>
      </View>

      {/* Balance */}
      <View className={`mt-4 p-4 ${isDarkMode ? "bg-[#272727]" : "bg-white"} rounded-2xl flex-row justify-between items-center`}>
        <View>
          <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg`}>Balance</Text>
          <View className="flex-row items-center">
            <Text id="text-balance" className={`${isDarkMode ? "text-white" : "text-black"} text-2xl font-bold`}>
              {isBalanceHidden ? "***************" : `Rp${walletData?.balance.toLocaleString('id-ID') || "Loading..."}`}
            </Text>
            <TouchableOpacity onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
              <Feather
                id="btn-hide-balance"
                name={isBalanceHidden ? "eye-off" : "eye"}
                size={20}
                color="gray"
                style={{ marginLeft: 12 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction button */}
        <View className="flex items-end">
          <TouchableOpacity
            id="btn-topup"
            className="bg-[#0061FF] p-2 rounded-[10px] mb-3 shadow-md shadow-[#19918F]"
            onPress={() => router.push("/topup")}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            id="btn-transfer"
            className="bg-[#0061FF] p-2 rounded-[10px] shadow-md shadow-[#19918F]"
            onPress={() => router.push("/transfer")}
          >
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History */}
      <View className={`mt-4 p-4 ${isDarkMode ? "bg-[#272727]" : "bg-white"} rounded-lg`}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-xl`}>
            Transaction History
          </Text>
          <TouchableOpacity id="btn-show-all-transaction" onPress={() => router.push("/transactions")}>
            <Text className="text-blue-500 font-semibold">Show all</Text>
          </TouchableOpacity>
        </View>

        <View className="h-[1px] bg-gray-300 w-full mb-3" />

        {recentTransactions.length === 0 ? (
          <Text className="text-gray-500">No recent transactions found.</Text>
        ) : (
          recentTransactions.map((item, i) => {
            const isTopup = item.transactionType === "TOP_UP";
            const isSender = item.walletId === walletData?.id;
            const isReceiver = item.recipientWalletId === walletData?.id;

            const name =
              item.transactionType === "TOP_UP"
                ? item.senderFullname
                : isSender
                ? item.receiverFullname
                : item.senderFullname;

            const date = new Date(item.transactionDate).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });

            const amountValue = parseFloat(item.amount as any);
            const amount = `${isTopup || isReceiver ? "+" : "-"} Rp${amountValue.toLocaleString("id-ID")}`;
            const amountColor = isTopup || isReceiver ? "text-green-500" : isDarkMode ? "text-white" : "text-black";

            return (
              <TouchableOpacity
                id="transaction-item"
                key={i}
                onPress={() => router.push(`/proof?transactionId=${item.id}`)}
              >
                <View
                  className="flex-row justify-between items-center border-b border-gray-300 py-3"
                >
                  <View className="flex-row items-center">
                    <Image
                      id="img-avatar"
                      source={require("../../public/images/default-avatar.png")}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <View>
                      <Text id="text-fullname" className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                        {name || "Unknown"}
                      </Text>
                      <Text id="text-transaction-type" className={`${isDarkMode ? "text-white" : "text-black"}`}>
                        {item.transactionType === "TOP_UP" ? "Topup" : "Transfer"}
                      </Text>
                      <Text className="text-gray-500 text-xs">{date}</Text>
                    </View>
                  </View>
                  <Text id="text-amount" className={`${amountColor} font-bold`}>
                    {amount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default Dashboard;
