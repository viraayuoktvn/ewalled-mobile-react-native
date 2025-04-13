import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";
import api, { getWalletByUserId, TransactionResponse, WalletResponse } from "@/services/api";
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        console.log("Token is missing!");
        return; 
      }

      const { data: userRes } = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data: wallets } = await api.get(`/api/wallets/user/${userRes.data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      try {
        const { data: walletsResponse } = await getWalletByUserId(userRes.data.id, token);

        if (!walletsResponse || !Array.isArray(walletsResponse.data) || walletsResponse.data.length === 0) {
          console.log("No wallets found");
          return;
        }

        const wallet = walletsResponse.data.find((w: WalletResponse) => w.userId === userRes.data.id);

        if (!wallet) {
          console.log("Wallet not found");
          return;
        }

        console.log("Found Wallet:", wallet);
  
        const walletId = String(wallet.id); 
        setWalletId(walletId);
  
        const { data: tx } = await api.get(`/api/transactions/filter`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { walletId: wallet.id, page: 0, size: 100 },
        });
  
        setTransactions(tx.data.content || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wallet:", error);
        setLoading(false);
      }
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

  const renderTransaction = (item: TransactionResponse, index: number) => {
    const isTopup = item.transactionType === "TOP_UP";
    const isSender = Number(walletId) === item.walletId;
    const isReceiver = item.recipientWalletId === walletId;

    const name = isTopup
      ? item.senderFullname
      : isSender
      ? item.receiverFullname
      : item.senderFullname;

    const date = new Date(item.transactionDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    
    const amount = `${isTopup || isReceiver ? "+" : "-"} ${parseInt(item.amount as any).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const amountColor = isTopup || isReceiver ? "text-green-500" : isDarkMode ? "text-white" : "text-black";

    return (
      <TouchableOpacity
        key={index}
        className={`rounded-2xl p-8 py-3 mb-2 shadow-sm ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        onPress={() => router.push(`/proof?transactionId=${item.id}`)}
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
      </TouchableOpacity>
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

      {/* Dropdown Filter Date */}
      {showDateDropdown && (
        <View className={`absolute top-[115px] left-4 z-20 w-32 rounded-md shadow px-4 py-2 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
          {["DESC", "ASC"].map(order => (
            <TouchableOpacity key={order} onPress={() => { setSortOrder(order as "ASC" | "DESC"); setShowDateDropdown(false); }}>
              <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                {order === "DESC" ? "Terbaru" : "Terlama"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Dropdown Filter Type */}
      {showTypeDropdown && (
        <View className={`absolute top-[115px] right-4 z-20 w-40 rounded-md shadow px-4 py-2 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
          {["ALL", "TOP_UP", "TRANSFER"].map(type => (
            <TouchableOpacity key={type} onPress={() => { setTransactionType(type as any); setShowTypeDropdown(false); }}>
              <Text className={`py-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                {type === "ALL" ? "All" : type === "TOP_UP" ? "Topup" : "Transfer"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView className={`${isDarkMode ? "bg-black" : "bg-[#f9f9f9]"} p-4`} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-8 mt-2">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Feather name="arrow-left" size={24} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ml-3 ${isDarkMode ? "text-white" : "text-black"}`}>
            Transactions History
          </Text>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row flex-wrap gap-4 mb-4">
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => setShowDateDropdown(!showDateDropdown)}
              className={`flex-row items-center px-4 py-2 rounded-full shadow-md ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
            >
              <Text className={`mr-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                {sortOrder === "ASC" ? "Terlama" : "Terbaru"}
              </Text>
              <Feather name="chevron-down" size={16} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <TouchableOpacity
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              className={`flex-row items-center px-4 py-2 rounded-full shadow-md ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
            >
              <Text className={`mr-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                {transactionType === "TOP_UP" ? "Topup" : transactionType === "TRANSFER" ? "Transfer" : "All"}
              </Text>
              <Feather name="chevron-down" size={16} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading / List */}
        {loading ? (
          <ActivityIndicator size="large" color="#0061FF" className="mt-10" />
        ) : (
          <>
            {paginatedTx.map(renderTransaction)}

            {/* Pagination */}
              <View className="flex-row justify-center items-center mt-6 mb-10 space-x-0 rounded-full border border-gray-300 px-1">
                {/* First */}
                <TouchableOpacity
                  onPress={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 mx-0.5 border rounded-l-md ${currentPage === 1 ? "border-gray-300 bg-transparent" : "border-[#0061FF]"}`}
                >
                  <Text className={`text-sm font-semibold ${currentPage === 1 ? "text-gray-500" : "text-[#0061FF]"}`}>First</Text>
                </TouchableOpacity>

                {/* Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <TouchableOpacity
                    key={page}
                    onPress={() => setCurrentPage(page)}
                    className={`px-3 py-2 border ${page === currentPage ? "bg-[#0061FF] border-[#0061FF]" : "border-[#0061FF] bg-[#E9E9E9]"}`}
                  >
                    <Text className={`font-semibold ${page === currentPage ? "text-white" : "text-[#0061FF]"}`}>{page}</Text>
                  </TouchableOpacity>
                ))}

                {/* Next */}
                <TouchableOpacity
                  onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 mx-0.5 border rounded-r-md ${currentPage === totalPages ? "border-gray-300 bg-transparent" : "border-[#0061FF]"}`}
                >
                  <Text className={`text-sm font-semibold ${currentPage === totalPages ? "text-gray-500" : "text-[#0061FF]"}`}>Next</Text>
                </TouchableOpacity>
              </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Transactions;
