import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCallback, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../contexts/ThemeContext";
import { getWalletById, TopUpPayload, topUpWallet } from "@/services/api";
import { useFocusEffect, useRouter } from "expo-router";
import { useUserContext } from "@/contexts/UserContext";

const { width } = Dimensions.get("window");

const TopUpScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<string>("BYOND Pay");
  const [amount, setAmount] = useState<string>(""); 
  const [rawAmount, setRawAmount] = useState<string>(""); 
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { wallet: myWallet } = useUserContext(); 
  const [isLoading, setIsLoading] = useState(false);

  const isLargeScreen = width > 768;
  const router = useRouter();

  // To reset data after back to topup page
  useFocusEffect(
    useCallback(() => {
      setAmount("");
      setRawAmount("");
      setNotes("");
      setSelectedMethod("BYOND Pay");
      setErrorMessage("");
    }, [])
  );

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/\D/g, ""); 
    setRawAmount(cleaned);

    if (cleaned === "") {
      setAmount("");
      setErrorMessage("");
      return;
    }

    const numericValue = parseInt(cleaned, 10);
    const formatted = numericValue.toLocaleString("id-ID");
    setAmount(formatted);

    if (numericValue < 10000) {
      setErrorMessage("Minimum transaction is IDR 10.000");
    } else if (numericValue > 2000000) {
      setErrorMessage("Maximum transaction is IDR 2.000.000");
    } else {
      setErrorMessage("");
    }
  };

  const handleTopUp = async () => {
    if (rawAmount === "" || errorMessage) return;
  
    setIsLoading(true);
    try {
      const walletId = myWallet?.id;
  
      if (!walletId) {
        alert("Wallet not found. Please re-login.");
        return;
      }
  
      const payload: TopUpPayload = {
        walletId,
        transactionType: "TOP_UP",
        amount: rawAmount,
        option: selectedMethod,
        description: notes,
      };
  
      const transaction = await topUpWallet(payload);
      
      const transactionId = transaction.id;
  
      router.push(`/proof?transactionId=${transactionId}`);
  
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Unknown error";
      setErrorMessage(msg);
      console.error("Error:", msg);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className={isDarkMode ? "bg-[#272727]" : "bg-white"}
      >
        <View className="flex-1 p-6">
          <View
            className="flex-grow w-full max-w-md"
            style={{
              width: isLargeScreen ? "60%" : "100%",
              alignSelf: "center",
            }}
          >
            <Text
              className={`text-xl font-bold mb-12 ${isDarkMode ? "text-white" : "text-black"} text-left`}
            >
              Top Up
            </Text>

            {/* Input data */}
            <Text
              className={`text-gray-400 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Amount
            </Text>
            <View className="flex-row items-center border-b border-gray-100 pb-2 mb-6">
              <Text
                className={`text-lg mr-2 self-start ${isDarkMode ? "text-white" : "text-black"}`}
              >
                IDR
              </Text>
              <TextInput
                id="input-amount"
                className="flex-1 ml-2 w-full"
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={isDarkMode ? "white" : "black"}
                value={amount}
                onChangeText={handleAmountChange}
                style={{
                  fontSize: isLargeScreen ? 50 : 40,
                  color: isDarkMode ? "white" : "black",
                }}
              />
            </View>

            {errorMessage ? (
              <Text className="text-red-500 mb-4" style={{ fontSize: 14 }}>
                {errorMessage}
              </Text>
            ) : null}

            {/* Choose payment method */}
            <Text
              className={`text-gray-400 mb-3 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Payment Method
            </Text>
            <View
              id="dropdown-method"
              className="rounded-lg mb-6"
              style={{
                backgroundColor: isDarkMode ? "#444444" : "#f5f5f5",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={selectedMethod}
                onValueChange={(itemValue: string) => setSelectedMethod(itemValue)}
                style={{
                  backgroundColor: isDarkMode ? "#444444" : "#f5f5f5",
                  color: isDarkMode ? "white" : "black",
                }}
              >
                <Picker.Item label="BYOND Pay" value="BYOND Pay" />
                <Picker.Item label="Bank Transfer" value="Bank Transfer" />
                <Picker.Item label="Credit Card" value="Credit Card" />
              </Picker>
            </View>

            {/* Input notes */}
            <Text
              className={`text-gray-400 mt-4 mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Notes
            </Text>
            <TextInput
              id="input-notes"
              className="border-b border-gray-100 pb-2 mb-6"
              value={notes}
              onChangeText={setNotes}
              style={{
                fontSize: isLargeScreen ? 20 : 16,
                color: isDarkMode ? "white" : "black",
              }}
            />
          </View>

          {/* Button top up */}
          <TouchableOpacity
            id="btn-topup"
            className={`p-4 rounded-lg w-full max-w-md ${
              rawAmount === "" || isLoading ? "bg-gray-400" : "bg-[#0061FF]"
            }`}
            style={{
              width: isLargeScreen ? "50%" : "100%",
              alignSelf: "center",
              marginTop: 20,
            }}
            onPress={handleTopUp}
            disabled={rawAmount === "" || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold">Top Up</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TopUpScreen;