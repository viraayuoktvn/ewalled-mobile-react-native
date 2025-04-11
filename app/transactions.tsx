import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { TransactionResponse, WalletResponse } from "@/services/api";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const ITEMS_PER_PAGE = 8;

const Transactions = () => {
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [filtered, setFiltered] = useState<TransactionResponse[]>([]);
  const [walletId, setWalletId] = useState<string | null>(null);

  const [transactionType, setTransactionType] = useState<"ALL" | "TOP_UP" | "TRANSFER">("ALL");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hasChosenDateFilter, setHasChosenDateFilter] = useState(false);
  const [hasChosenTypeFilter, setHasChosenTypeFilter] = useState(false);

  useEffect(() => {
    console.log("Jumlah transaksi awal:", transactions.length);

    const fetchData = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const user = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wallets = await api.get(`/api/wallets/user/${user.data.data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wallet = wallets.data.find((w: WalletResponse) => w.user.id === user.data.data.id);
      if (!wallet) return;
      setWalletId(wallet.id);

      const tx = await api.get(`/api/transactions/filter`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          walletId: wallet.id,
          page: 0,
          size: 100, 
        },
      });      

      setTransactions(tx.data.content || []);
      console.log("TX DATA FULL:", tx.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filteredTx = [...transactions];

    if (transactionType !== "ALL") {
      filteredTx = filteredTx.filter(tx => tx.transactionType === transactionType);
    }

    filteredTx.sort((a, b) =>
      sortOrder === "ASC"
        ? new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
        : new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );

    setFiltered(filteredTx);
    setCurrentPage(1);
  }, [transactions, transactionType, sortOrder]);

  const paginatedTx = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const getSortOrderLabel = () => {
    return sortOrder === "ASC" ? "Terlama" : "Terbaru";
  };
  
  const getTransactionTypeLabel = () => {
    switch (transactionType) {
      case "TOP_UP":
        return "Topup";
      case "TRANSFER":
        return "Transfer";
      default:
        return "All";
    }
  };  

  const renderTransaction = (item: TransactionResponse, index: number) => {
    const isTopup = item.transactionType === "TOP_UP";
    const isSender = Number(walletId) === item.walletId;
    const isReceiver = item.recipientWalletId === walletId;

    const name =
      item.transactionType === "TOP_UP"
        ? item.senderName
        : isSender
        ? item.recipientName
        : item.senderName;

    const date = new Date(item.transactionDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const amount = `${isTopup || isReceiver ? "+" : "-"} ${Number(item.amount).toLocaleString("id-ID")},00`;
    const amountColor = isTopup || isReceiver ? "text-green-500" : isDarkMode ? "text-white" : "text-black";

    return (
      <View
        key={index}
        className={`rounded-2xl p-8 py-3 mb-2 shadow-sm ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-300 rounded-full mr-3" />
            <View>
              <Text className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>{name}</Text>
              <Text className={isDarkMode ? "text-gray-300" : "text-black"}>
                {item.transactionType === "TOP_UP" ? "Topup" : "Transfer"}
              </Text>
              <Text className="text-gray-400 text-xs">{date}</Text>
            </View>
          </View>
          <Text className={`text-right font-semibold ${amountColor}`}>{amount}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 relative">
      {(showDateDropdown || showTypeDropdown) && (
        <TouchableOpacity
          className="absolute inset-0 z-10"
          onPress={() => {
            setShowDateDropdown(false);
            setShowTypeDropdown(false);
          }}
        />
      )}

      {showDateDropdown && (
        <View className={`absolute top-[115px] left-4 z-20 w-0 rounded-md shadow px-4 py-2 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
          <TouchableOpacity onPress={() => { setSortOrder("DESC"); setShowDateDropdown(false); }}>
            <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>Terbaru</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSortOrder("ASC"); setShowDateDropdown(false); }}>
            <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>Terlama</Text>
          </TouchableOpacity>
        </View>
      )}

      {showTypeDropdown && (
        <View className={`absolute top-[115px] right-4 z-20 w-40 rounded-md shadow px-4 py-2 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
          <TouchableOpacity onPress={() => { setTransactionType("ALL"); setShowTypeDropdown(false); }}>
            <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setTransactionType("TOP_UP"); setShowTypeDropdown(false); }}>
            <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>Topup</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setTransactionType("TRANSFER"); setShowTypeDropdown(false); }}>
            <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>Transfer</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className={`${isDarkMode ? "bg-black" : "bg-[#f9f9f9]"} p-4 h-full`} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row items-center mb-8 mt-2">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Feather name="arrow-left" size={24} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ml-3 ${isDarkMode ? "text-white" : "text-black"}`}>
            Transactions History
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-4">
          <View className="flex-1">
          <TouchableOpacity
            onPress={() => setShowDateDropdown(!showDateDropdown)}
            className={`flex-row items-center px-4 py-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-[#FFFFFF]"} shadow-md`}
          >
            <Text className={`mr-2 ${isDarkMode ? "text-white" : "text-black"}`}>
              {hasChosenDateFilter ? (sortOrder === "ASC" ? "Terlama" : "Terbaru") : "Filter by Date"}
            </Text>
            <Feather name="chevron-down" size={16} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
          </View>

          <View className="flex-1">
          <TouchableOpacity
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            className={`flex-row items-center px-4 py-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-[#FFFFFF] shadow-md"}`}
          >
            <Text className={`mr-2 ${isDarkMode ? "text-white" : "text-black"}`}>
              {hasChosenTypeFilter
                ? transactionType === "TOP_UP"
                  ? "Topup"
                  : transactionType === "TRANSFER"
                  ? "Transfer"
                  : "All"
                : "Filter by Type"}
            </Text>
            <Feather name="chevron-down" size={16} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0061FF" className="mt-10" />
        ) : (
          <>
            {paginatedTx.map(renderTransaction)}

            <View
              className={`flex-row justify-center items-center mt-6 mb-10 space-x-0 rounded-full border border-gray-300 px-1 ${
                isDarkMode ? "bg-gray-800" : "bg-[#fffff]"
              }`}
            >
              <TouchableOpacity
                onPress={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 mx-0.5 border rounded-l-md ${
                  currentPage === 1
                    ? isDarkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-[#fffff] border-gray-300"
                    : isDarkMode
                    ? "bg-transparent border-gray-400"
                    : "bg-transparent border-[#0061FF]"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    currentPage === 1
                      ? "text-gray-500"
                      : isDarkMode
                      ? "text-white"
                      : "text-[#0061FF]"
                  }`}
                >
                  First
                </Text>
              </TouchableOpacity>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => Math.abs(page - currentPage) <= 1)
                .map((page) => {
                  const isActive = page === currentPage;
                  return (
                    <TouchableOpacity
                      key={page}
                      onPress={() => setCurrentPage(page)}
                      className={`px-3 py-2 border ${
                        isActive
                          ? "bg-[#0061FF] border-[#0061FF]"
                          : isDarkMode
                          ? "bg-transparent border-gray-400"
                          : "bg-[#E9E9E9] border-[#0061FF]"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          isActive
                            ? "text-white"
                            : isDarkMode
                            ? "text-white"
                            : "text-[#0061FF]"
                        }`}
                      >
                        {page}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

              <TouchableOpacity
                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 mx-0.5 border rounded-r-md ${
                  currentPage === totalPages
                    ? isDarkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-[#ffff] border-gray-300"
                    : isDarkMode
                    ? "bg-transparent border-gray-400"
                    : "bg-transparent border-[#0061FF]"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    currentPage === totalPages
                      ? "text-gray-500"
                      : isDarkMode
                      ? "text-white"
                      : "text-[#0061FF]"
                  }`}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Transactions;
