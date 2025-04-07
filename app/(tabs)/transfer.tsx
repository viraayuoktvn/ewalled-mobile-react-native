import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getAllWallets, transfer, WalletResponse } from "../../services/api";
import { useUserContext } from "../../contexts/UserContext";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

const TransferScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { wallet: myWallet, setWallet } = useUserContext();

  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Tunggu data wallet ada dulu
  if (!myWallet) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0061FF" />
      </View>
    );
  }

  const myWalletId = myWallet.id;

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const allWallets = await getAllWallets();
        const otherWallets = allWallets.filter((w: WalletResponse) => w.id !== myWalletId);
        setWallets(otherWallets);
      } catch (err) {
        console.error("Failed to fetch wallets", err);
      }
    };

    fetchWallets();
  }, []);

  const handleTransfer = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to transfer.");
      return;
    }

    if (!selectedWallet) {
      Alert.alert("No Recipient", "Please select a wallet to send to.");
      return;
    }

    setIsLoading(true);

    try {
      await transfer({
        walletId: myWallet.id, 
        transactionType: "TRANSFER",
        amount: String(amount), 
        recipientAccountNumber: selectedWallet.accountNumber,
        description: notes,
      });

      Alert.alert("✅ Success", "Transfer completed successfully!");
      setAmount("");
      setNotes("");
      setSelectedWallet(null);

      // Optional: refresh wallet balance
      const updatedWallets = await getAllWallets();
      const updatedMyWallet = updatedWallets.find((w: WalletResponse) => w.id === myWallet?.id);
      if (updatedMyWallet) {
        setWallet(updatedMyWallet);
      }
    } catch (error: any) {
      Alert.alert("🚨 Transfer Failed", error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-6`}
      style={{ alignItems: "center" }}
    >
      <Text
        className={`text-xl font-bold mb-6 mt-12 w-full max-w-md ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        Transfer
      </Text>

      {/* Recipient Picker */}
      <Text
        className={`text-sm mb-2 w-full max-w-md ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        Select Recipient:
      </Text>
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`p-3 m-1 rounded-md border ${
              selectedWallet?.id === item.id
                ? "bg-blue-500 border-blue-700"
                : "bg-gray-200 border-gray-400"
            }`}
            onPress={() => setSelectedWallet(item)}
          >
            <Text
              className={`text-sm ${
                selectedWallet?.id === item.id ? "text-white" : "text-black"
              }`}
            >
              {item.accountNumber}
            </Text>
          </TouchableOpacity>
        )}
        style={{ maxWidth: "100%", marginBottom: 10 }}
      />

      {/* Amount */}
      <Text
        className={`text-gray-400 mb-2 mt-4 w-full max-w-md text-left ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        Amount
      </Text>
      <View
        className={`flex-row items-center border-b pb-2 mb-2 w-full max-w-md ${
          isDarkMode ? "border-gray-100" : "border-gray-300"
        }`}
      >
        <Text
          className={`text-lg mr-2 self-start ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
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
      <View className={`flex-row justify-between mb-4 w-full max-w-md`}>
        <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>
          Your Balance
        </Text>
        <Text className="text-[#0061FF] text-sm">
          IDR {myWallet.balance.toLocaleString()}
        </Text>
      </View>

      {/* Notes */}
      <Text
        className={`text-gray-400 mt-8 mb-4 w-full max-w-md text-left ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        Notes
      </Text>
      <TextInput
        className={`border-b mb-6 text-lg w-full max-w-md ${
          isDarkMode ? "border-gray-100" : "border-gray-300"
        }`}
        placeholder="Optional note"
        value={notes}
        onChangeText={setNotes}
        style={{
          color: isDarkMode ? "white" : "black",
        }}
      />

      {/* Button */}
      <TouchableOpacity
        className="p-4 rounded-lg mt-auto w-full max-w-md bg-[#0061FF]"
        style={{ justifyContent: "center", alignItems: "center" }}
        onPress={handleTransfer}
        disabled={isLoading}
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