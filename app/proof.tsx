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
import { useNavigation, useRoute } from "@react-navigation/native";  
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
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [showDetail, setShowDetail] = useState(false);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const route = useRoute();
  const { transactionId } = route.params as { transactionId: string }; 

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      try {
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
  }, [transactionId]); 

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
      setShowPopup(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Error during download:", err);
        alert(`Download failed: ${err.message}`);
      } else {
        console.error("❌ Unknown error during download", err);
        alert("Download failed: Unknown error");
      }
    }
  };

  useEffect(() => {
    if (showPopup) {
      let timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setShowPopup(false);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showPopup]);

  const convertToWIB = (date: string) => {
    return moment(date).tz('Asia/Jakarta').format('DD MMM YYYY - HH:mm');
  };

  const dateInWIB = transaction ? convertToWIB(transaction.transactionDate) : "Tanggal tidak tersedia";    

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
          id="btn-back"
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
        {/* Image success */}
        <View className="w-full">
          <View  style={{ width: "100%", height: 156, backgroundColor: "#0061FF", marginBottom: 50 }}>
            <Image
              id="navbar-success"
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

          {/* Transaction date */}
          <Text
            id="text-transaction-date"
            className={`text-center my-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {dateInWIB}
          </Text>

          {/* Transaction data */}
          <View
            className={`rounded-2xl m-6 p-8 shadow-md ${
              isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          >
            <Row
              label="Amount"
              value={`Rp${transaction.amount.toLocaleString("id-ID")}`}
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
                  value={`Rp${transaction.amount.toLocaleString("id-ID")}`}
                  dark={isDarkMode}
                />
              </>
            )}

            {/* Button show detail */}
            <TouchableOpacity
              id="btn-detail-transaction"
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
              id="btn-download"
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
              id="btn-done"
              onPress={() => router.push("/")}
              className="bg-blue-600 px-6 py-3 rounded-xl min-w-[120px] items-center mt-4"
            >
              <Text className="text-white font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Pop up modal download success */}
      {showPopup && (
        <View className="absolute top-0 left-0 w-full h-full bg-black/60 justify-center items-center z-50">
          <View className="bg-white rounded-2xl px-6 py-8 shadow-lg w-3/4 max-w-sm items-center">
            <Text className="text-xl font-bold text-black mb-2">Download Success!</Text>
            <Text className="text-sm text-gray-500">Close in... ({countdown})</Text>
          </View>
        </View>
      )}
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
