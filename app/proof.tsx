import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";  // Menggunakan useRoute untuk mengambil parameter
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, {
  UserResponse,
  WalletResponse,
  TransactionResponse,
  downloadTransactionProof,
} from "@/services/api";
import { Feather } from "@expo/vector-icons";
import moment from "moment-timezone";
import { router } from "expo-router";

const TransactionSuccess: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [showDetail, setShowDetail] = useState(false);

  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null); // Mengganti state menjadi transaction
  const [isLoading, setIsLoading] = useState(true);

  const route = useRoute();
  const { transactionId } = route.params as { transactionId: string }; // Mengambil ID transaksi dari params route

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      try {
        // Mengambil data pengguna
        const userRes = await api.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userRes.data.data;
        setUserData(user);

        const walletRes = await api.get(`/api/wallets/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const wallets = Array.isArray(walletRes.data.data) ? walletRes.data.data : [];
        const userWallet = wallets.find((w: WalletResponse) => w.user.id === user.id);
        setWalletData(userWallet);

        if (userWallet) {
          // Ambil transaksi berdasarkan ID yang diteruskan dari halaman sebelumnya
          const txRes = await api.get(`/api/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const transactionData: TransactionResponse = txRes.data.data;
          setTransaction(transactionData);
        }
      } catch (error) {
        console.error("❌ Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [transactionId]);  // Menggunakan transactionId sebagai dependensi effect

  const handleDownload = async () => {
    if (!transaction) {
      console.warn("⚠️ No transaction available");
      return;
    }
  
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      alert("Token not found. Please log in again.");
      return;
    }
  
    try {
      await downloadTransactionProof(transaction.id, token);
      alert("Download successful!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Error during download:", err);
        alert(`Download failed: ${err.message}`);
      } else {
        // Handle if the error is not an instance of Error
        console.error("❌ Unknown error during download", err);
        alert("Download failed: Unknown error");
      }
    }
  };  

  const formattedDate = (dateStr: string) => {
    const date = moment(dateStr);
    
    return date.tz('Asia/Jakarta').format('HH:mm - D MMMM YYYY');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-lg text-center text-gray-700 font-semibold">
          No transaction found.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Back to Previous Page</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1`}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[600px] pt-10">
          <View className="w-full overflow-hidden">
            <Image
              source={require("../public/images/navbar-success.png")}
              style={{ width: "100%", height: 200 }}
              resizeMode="cover"
            />
          </View>

          <Text
            className={`text-xl font-bold text-center mt-4 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Your transaction is successful!
          </Text>

          <Text
            className={`text-center my-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formattedDate(transaction.transactionDate)}
          </Text>

          <View
            className={`rounded-2xl m-6 p-8 shadow-md ${
              isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          >
            <Row
              label="Amount"
              value={`Rp ${transaction.amount.toLocaleString("id-ID")}`}
              dark={isDarkMode}
            />

            {transaction.transactionType === "TOP_UP" ? (
              <Row
                label="From"
                value={transaction.option || transaction.description || "-"}
                dark={isDarkMode}
              />
            ) : (
              <>
                <Row
                  label="Recipient"
                  value={transaction.receiverFullname || "-"}
                  sub={transaction.receiverAccountNumber}
                  dark={isDarkMode}
                />
                {showDetail && (
                  <Row
                    label="Sender"
                    value={transaction.senderFullname || userData?.fullname || "-"}
                    sub={transaction.senderAccountNumber || walletData?.accountNumber}
                    dark={isDarkMode}
                  />
                )}
              </>
            )}

            {showDetail && (
              <>
                <Row label="Transaction Id" value={`${transaction.id}`} dark={isDarkMode} />
                <Row label="Notes" value={transaction.description || "-"} dark={isDarkMode} />
                <Row label="Admin Fee" value="Rp 0" dark={isDarkMode} />
                <Row
                  label="Total"
                  value={`Rp ${transaction.amount.toLocaleString("id-ID")}`}
                  dark={isDarkMode}
                />
              </>
            )}

            <TouchableOpacity
              onPress={() => setShowDetail(!showDetail)}
              className={`mt-3 py-2 px-3 rounded-lg items-center ${
                isDarkMode ? "bg-gray-700" : "bg-blue-100"
              }`}
            >
              <Text className="font-bold text-blue-600">
                {showDetail ? "Hide Detail" : "Show Detail"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className={`w-full justify-between items-center px-12 ${
              width > 400 ? "flex-row" : "flex-col"
            }`}
          >
            <TouchableOpacity
              onPress={handleDownload}
              style={{
                padding: 12,
                borderRadius: 50,
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 97, 255, 0.1)",
              }}
            >
              <Feather name="download" size={20} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/")}
              className="bg-blue-600 px-6 py-3 rounded-xl min-w-[120px] items-center mt-4"
            >
              <Text className="text-white font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({
  label,
  value,
  sub,
  dark,
}: {
  label: string;
  value: string;
  sub?: string;
  dark: boolean;
}) => (
  <View
    className={`flex-row justify-between items-center py-2 border-b ${
      dark ? "border-gray-700" : "border-gray-300"
    }`}
  >
    <Text
      className={`text-sm font-normal w-1/2 ${
        dark ? "text-gray-400" : "text-gray-500"
      }`}
    >
      {label}
    </Text>
    <View className="items-end w-1/2">
      <Text
        className={`text-sm font-semibold ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {value}
      </Text>
      {sub && <Text className="text-xs mt-1 text-gray-500">{sub}</Text>}
    </View>
  </View>
);

export default TransactionSuccess;