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
} from "@/services/api";
import { router } from "expo-router";
import * as Linking from "expo-linking";

const TransactionSuccess: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [showDetail, setShowDetail] = useState(false);

  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [latestTransaction, setLatestTransaction] =
    useState<TransactionResponse | null>(null);

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

        const wallets = Array.isArray(walletRes.data)
          ? walletRes.data
          : [];
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
    const id = latestTransaction?.id;
    if (!id) return;

    const token = await AsyncStorage.getItem("authToken");
    const downloadUrl = `${api.defaults.baseURL}/api/transactions/export-pdf/${id}`;

    try {
        // include token jika backend kamu perlu auth (opsional)
        const finalUrl = `${downloadUrl}?token=${token}`;
        await Linking.openURL(finalUrl);
    } catch (error) {
        console.error("Failed to open URL", error);
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
        <View className="w-full max-w-[600px] px-5 pt-5">
            <View className="w-full overflow-hidden rounded-2xl">
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
            className={`w-full rounded-2xl mt-5 p-4 shadow-md ${
              isDarkMode ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          >
            <Row
              label="Amount"
              value={`Rp ${latestTransaction.amount.toLocaleString()}`}
              dark={isDarkMode}
            />
            <Row
              label="Recipient"
              value={latestTransaction.recipientName || "-"}
              sub={latestTransaction.recipientWalletId?.toString()}
              dark={isDarkMode}
            />

            {showDetail && (
              <>
                <Row
                  label="Sender"
                  value={userData.fullname}
                  sub={walletData?.accountNumber}
                  dark={isDarkMode}
                />
                <Row
                  label="Transaction Id"
                  value={`F${latestTransaction.id}`}
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
            className={`w-full justify-between items-center mt-4 px-12 ${
              width > 500 ? "flex-row" : "flex-col"
            }`}
          >
            <TouchableOpacity
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
              className="bg-blue-600 px-6 py-3 rounded-xl min-w-[120px] items-center"
            >
              <Text className="text-white font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  <View className="mb-3">
    <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
      {label}
    </Text>
    <View>
      <Text
        className={`text-base font-semibold ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {value}
      </Text>
      {sub && <Text className="text-xs text-gray-500">{sub}</Text>}
    </View>
  </View>
);

export default TransactionSuccess;