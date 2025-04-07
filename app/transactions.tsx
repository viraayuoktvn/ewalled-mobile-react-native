// app/transactions.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { SelectList } from "react-native-dropdown-select-list";
import api, { ApiResponse, TransactionResponse } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Transactions = () => {
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  const typeOptions = [
    { key: "TOP_UP", value: "Topup" },
    { key: "TRANSFER", value: "Transfer" },
  ];

  const dateOptions = [
    { key: "2024-12-08", value: "08 December 2024" },
    { key: "2024-12-07", value: "07 December 2024" },
    // Tambahkan opsi lainnya sesuai kebutuhan
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await api.get<ApiResponse<TransactionResponse[]>>("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tx = response.data.data || [];
      setTransactions(tx);
    };

    fetchTransactions();
  }, []);

  const filteredTx = transactions.filter((tx) => {
    const matchType = filterType ? tx.type === filterType : true;
    const matchDate = filterDate
      ? new Date(tx.transactionDate).toISOString().slice(0, 10) === filterDate
      : true;
    return matchType && matchDate;
  });

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} px-4 pt-12`}>
      <Text className="text-xl font-bold mb-4">Transaction History</Text>

      <View className="flex-row space-x-4 mb-4">
        <SelectList
          setSelected={(val: string) => setFilterDate(val)}
          data={dateOptions}
          save="key"
          placeholder="Filter by Date"
          boxStyles={{ backgroundColor: "#f1f1f1" }}
        />
        <SelectList
          setSelected={(val: string) => setFilterType(val)}
          data={typeOptions}
          save="key"
          placeholder="Filter by Type"
          boxStyles={{ backgroundColor: "#f1f1f1" }}
        />
      </View>

      <View className="rounded-xl bg-white shadow p-4">
        {filteredTx.map((tx, index) => {
          const isTopup = tx.type === "TOP_UP";
          const name =
            tx.type === "TOP_UP"
              ? tx.receiverWallet?.user?.fullname
              : tx.senderWallet?.user?.fullname;
          const date = new Date(tx.transactionDate).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          const amount = `${isTopup ? "+" : "-"} ${parseInt(tx.amount).toLocaleString("id-ID")},00`;

          return (
            <View
              key={index}
              className="flex-row justify-between items-center border-b border-gray-200 py-3"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
                <View>
                  <Text className="font-semibold text-black">{name || "Unknown"}</Text>
                  <Text className="text-gray-600">{tx.type === "TOP_UP" ? "Topup" : "Transfer"}</Text>
                  <Text className="text-xs text-gray-500">{date}</Text>
                </View>
              </View>
              <Text
                className={`font-bold ${isTopup ? "text-green-500" : "text-black"}`}
              >
                {amount}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Pagination placeholder (if needed) */}
      <View className="flex-row justify-center items-center space-x-4 mt-6">
        <Text className="text-gray-500">First</Text>
        <Text className="text-gray-900 font-bold">1</Text>
        <Text className="text-blue-500">2</Text>
        <Text className="text-gray-500">3</Text>
        <Text className="text-blue-500">Next</Text>
      </View>
    </ScrollView>
  );
};

export default Transactions;
