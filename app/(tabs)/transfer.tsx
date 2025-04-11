import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getAllWallets, transfer, WalletResponse } from "../../services/api";
import { useUserContext } from "../../contexts/UserContext";
import RNPickerSelect from "react-native-picker-select";
import { useRouter, useFocusEffect } from "expo-router";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

const TransferScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { wallet: myWallet, setWallet } = useUserContext();
  const router = useRouter();

  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallets, setWallets] = useState<WalletResponse[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletResponse | null>(null);
  const [isFetchingWallet, setIsFetchingWallet] = useState(true);

  const refreshWalletData = async () => {
    try {
      setIsFetchingWallet(true);
      const allWallets = await getAllWallets();
      const otherWallets = allWallets.filter((w: WalletResponse) => w.id !== myWallet?.id);
      setWallets(otherWallets);

      const updatedMyWallet = allWallets.find((w: WalletResponse) => w.id === myWallet?.id);
      if (updatedMyWallet) {
        console.log("Wallet balance type:", typeof updatedMyWallet.balance, updatedMyWallet.balance);
        setWallet(updatedMyWallet);
      }
    } catch (err) {
      console.error("Failed to refresh wallets", err);
      Alert.alert("Error", "Failed to load wallets.");
    } finally {
      setIsFetchingWallet(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAmount("");
      setNotes("");
      setSelectedWallet(null);
      if (myWallet) refreshWalletData();
    }, [myWallet?.id])
  );

  const handleTransfer = async () => {
    const numericAmount = Number(amount);

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to transfer.");
      return;
    }

    if (!selectedWallet) {
      Alert.alert("No Recipient", "Please select a wallet to send to.");
      return;
    }

    if (selectedWallet.id === myWallet?.id) {
      Alert.alert("Invalid Transfer", "You cannot transfer to your own wallet.");
      return;
    }

    if (numericAmount > myWallet!.balance) {
      Alert.alert("Insufficient Balance", "You don't have enough balance to transfer.");
      return;
    }

    setIsLoading(true);

    try {
      await transfer({
        walletId: myWallet!.id,
        transactionType: "TRANSFER",
        amount: String(numericAmount),
        recipientAccountNumber: selectedWallet.accountNumber,
        description: notes,
      });

      Alert.alert("✅ Success", "Transfer completed successfully!");
      setAmount("");
      setNotes("");
      setSelectedWallet(null);

      await refreshWalletData();
      router.replace("/proof");

    } catch (error: any) {
      Alert.alert("🚨 Transfer Failed", error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!myWallet) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0061FF" />
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-6`}
      style={{ alignItems: "center" }}
    >
      <Text
        className={`text-xl font-bold mb-6 w-full max-w-md ${isDarkMode ? "text-white" : "text-black"}`}
      >
        Transfer
      </Text>

      {/* Recipient Picker */}
      <Text className={`text-sm mb-2 w-full max-w-md ${isDarkMode ? "text-white" : "text-black"}`}>
        Select Recipient:
      </Text>

      <View className="w-full max-w-md mb-1">
        {wallets.length === 0 ? (
          <Text className="text-gray-500">No other wallets available for transfer.</Text>
        ) : (
          <View
            className={`rounded-lg border px-3 py-2 ${
              isDarkMode ? "bg-[#333] border-[#444]" : "bg-[#f0f0f0] border-[#ccc]"
            }`}
          >
            <RNPickerSelect
              onValueChange={(value) => {
                const selected = wallets.find((w) => w.id === parseInt(value));
                setSelectedWallet(selected || null);
              }}
              items={wallets.map((wallet) => ({
                label: wallet.accountNumber,
                value: String(wallet.id),
              }))}
              placeholder={{ label: "Choose wallet...", value: null }}
              value={selectedWallet ? String(selectedWallet.id) : null}
              useNativeAndroidPickerStyle={false}
              style={{
                inputIOS: {
                  color: isDarkMode ? "white" : "black",
                  fontSize: 16,
                  paddingVertical: 10,
                },
                inputAndroid: {
                  color: isDarkMode ? "white" : "black",
                  fontSize: 16,
                },
                placeholder: {
                  color: isDarkMode ? "#aaa" : "#666",
                },
                viewContainer: {
                  justifyContent: "center",
                },
              }}
            />
          </View>
        )}
        {!selectedWallet && wallets.length > 0 && (
          <Text
            className="text-sm mt-1"
            style={{
              color: isDarkMode ? "#FCA5A5" : "#DC2626",
            }}
          >
            Please select a recipient wallet
          </Text>
        )}
      </View>

      {/* Amount */}
      <Text className={`text-sm mb-2 mt-4 w-full max-w-md ${isDarkMode ? "text-white" : "text-black"}`}>
        Amount
      </Text>
      <View
        className={`flex-row items-center border-b pb-2 mb-2 w-full max-w-md ${
          isDarkMode ? "border-gray-100" : "border-gray-300"
        }`}
      >
        <Text className={`text-lg mr-2 self-start ${isDarkMode ? "text-white" : "text-black"}`}>
          IDR
        </Text>
        <TextInput
          className="flex-1 w-full"
          keyboardType="numeric"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          style={{
            fontSize: isLargeScreen ? 50 : 40,
            color: isDarkMode ? "white" : "black",
          }}
        />
      </View>

      {/* Balance Info */}
      <View className="flex-row justify-between mb-4 w-full max-w-md">
        <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>Your Balance</Text>
        <Text className="text-[#0061FF] text-sm">
          {isFetchingWallet ? "Loading..." : `IDR ${myWallet.balance.toLocaleString()}`}
        </Text>
      </View>

      {/* Notes */}
      <Text className={`text-sm mt-8 mb-4 w-full max-w-md ${isDarkMode ? "text-white" : "text-black"}`}>
        Notes
      </Text>
      <TextInput
        className={`border-b mb-6 text-lg w-full max-w-md ${
          isDarkMode ? "border-gray-100" : "border-gray-200"
        }`}
        placeholder=""
        value={notes}
        onChangeText={setNotes}
        style={{ color: isDarkMode ? "white" : "black" }}
      />

      {/* Button */}
      <TouchableOpacity
        className={`p-4 rounded-lg mt-auto w-full max-w-md ${
          isLoading || !selectedWallet || !amount || isNaN(Number(amount)) || Number(amount) <= 0
            ? "bg-gray-400"
            : "bg-[#0061FF]"
        }`}
        style={{ justifyContent: "center", alignItems: "center" }}
        onPress={handleTransfer}
        disabled={
          isLoading ||
          !selectedWallet ||
          !amount ||
          isNaN(Number(amount)) ||
          Number(amount) <= 0
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-bold">Transfer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TransferScreen;