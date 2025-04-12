// TransactionSuccess.tsx
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
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, {
  UserResponse,
  WalletResponse,
  TransactionResponse,
  downloadTransactionProof,
} from "@/services/api";
import { router } from "expo-router";

const TransactionSuccess: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [showDetail, setShowDetail] = useState(false);

  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [latestTransaction, setLatestTransaction] = useState<TransactionResponse | null>(null);

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

        const wallets = Array.isArray(walletRes.data) ? walletRes.data : [];
        const userWallet = wallets.find(
          (w: WalletResponse) => w.user.id === user.id
        );
        setWalletData(userWallet);

        if (userWallet) {
          const txRes = await api.get("/api/transactions/filter", {
            headers: { Authorization: `Bearer ${token}` },
            params: { walletId: userWallet.id },
          });
          const transactions = txRes.data.content || [];
          const sorted = transactions.sort(
            (a: TransactionResponse, b: TransactionResponse) => b.id - a.id
          );
          setLatestTransaction(sorted[0]);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    if (!latestTransaction) {
      console.warn("⚠️ No latestTransaction available");
      return;
    }

    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      await downloadTransactionProof(latestTransaction.id, token);
      alert("Download berhasil!");
    } catch (err: any) {
      console.error("❌ Error during download:", err);
      alert("Download failed. Please try again later.");
    }
  };

  const formattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!latestTransaction || !userData) return null;

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
        <View className="w-full max-w-[600px]">
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
            Your transaction is success!
          </Text>
          <Text
            className={`text-center my-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formattedDate(latestTransaction.transactionDate)}
          </Text>

          <View
            className={`rounded-2xl m-6 p-8 shadow-md ${
              isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          >
            <Row
              label="Amount"
              value={`Rp ${latestTransaction.amount.toLocaleString()}`}
              dark={isDarkMode}
            />

            {latestTransaction.transactionType === "TOP_UP" ? (
              <Row
                label="From"
                value={latestTransaction.option || latestTransaction.description || "-"}
                dark={isDarkMode}
              />
            ) : (
              <>
                <Row
                  label="Recipient"
                  value={latestTransaction.receiverFullname || "-"}
                  sub={latestTransaction.receiverAccountNumber}
                  dark={isDarkMode}
                />
                {showDetail && (
                  <Row
                    label="Sender"
                    value={latestTransaction.senderFullname || userData.fullname}
                    sub={latestTransaction.senderAccountNumber || walletData?.accountNumber}
                    dark={isDarkMode}
                  />
                )}
              </>
            )}

            {showDetail && (
              <>
                <Row
                  label="Transaction Id"
                  value={`${latestTransaction.id}`}
                  dark={isDarkMode}
                />
                <Row
                  label="Notes"
                  value={latestTransaction.description || "-"}
                  dark={isDarkMode}
                />
                <Row label="Admin Fee" value="Rp0" dark={isDarkMode} />
                <Row
                  label="Total"
                  value={`Rp ${latestTransaction.amount.toLocaleString()}`}
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
                {showDetail ? "Hide Detail" : "Detail Transaction"}
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
              className={`p-3 rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <Image
                source={require("../public/images/download.png")}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/")}
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
      {sub && (
        <Text className="text-xs mt-1 text-gray-500">{sub}</Text>
      )}
    </View>
  </View>
);

export default TransactionSuccess;