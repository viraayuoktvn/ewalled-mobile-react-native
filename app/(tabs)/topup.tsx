import { View, Text, TextInput, TouchableOpacity, Dimensions } from "react-native";
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
  const [notes, setNotes] = useState<string>("");
  const { wallet: myWallet } = useUserContext();

  const isLargeScreen = width > 768;

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setAmount("");
      setNotes("");
      setSelectedMethod("BYOND Pay");
    }, [])
  );

  const handleTopUp = async () => {
    try {
      const walletId = myWallet?.id;
      
      if (!walletId) {
        alert("Wallet not found. Please re-login.");
        return;
      } 
      
      const payload: TopUpPayload = {
        walletId,
        transactionType: "TOP_UP",
        amount,
        option: selectedMethod,
        description: notes,
      };

      await topUpWallet(payload);

      const updatedWallet = await getWalletById(walletId);
      console.log("Updated wallet:", updatedWallet); 

      // alert("Top up successful!");
      router.push("/proof"); 
    } catch (err: any) {
      alert(err.message);
    }
  };


  return (
    <View className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-6`}> 
      <View
        className="flex-grow w-full max-w-md"
        style={{
          width: isLargeScreen ? "60%" : "100%", 
          alignSelf: "center", 
        }}
      >
        {/* Header */}
        <Text className={`text-xl font-bold mb-12  ${isDarkMode ? "text-white" : "text-black"} text-left`}>Top Up</Text>

        {/* Amount Input */}
        <Text className={`text-gray-400 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>Amount</Text>
        <View className="flex-row items-center border-b border-gray-100 pb-2 mb-6">
          <Text className={`text-lg mr-2 self-start ${isDarkMode ? "text-white" : "text-black"}`}>IDR</Text>
          <TextInput
            className="flex-1 ml-2 w-full"
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

        {/* Payment Method */}
        <Text className={`text-gray-400 mb-3 ${isDarkMode ? "text-white" : "text-black"}`}>Payment Method</Text>
        <View className="rounded-lg mb-6 p-2" style={{ backgroundColor: isDarkMode ? "#444444" : "#f5f5f5", borderRadius: 8 }}>
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

        {/* Notes Input */}
        <Text className={`text-gray-400 mt-4 mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>Notes</Text>
        <TextInput
          className="border-b border-gray-100 pb-2 mb-6"
          value={notes}
          onChangeText={setNotes}
          style={{
            fontSize: isLargeScreen ? 20 : 16,
            color: isDarkMode ? "white" : "black", 
          }}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`p-4 rounded-lg w-full max-w-md ${
          amount === "" ? "bg-gray-400" : "bg-[#0061FF]"
        }`}
        style={{
          width: isLargeScreen ? "50%" : "100%",
          alignSelf: "center",
        }}
        onPress={handleTopUp}
        disabled={amount === ""}
      >
        <Text className="text-white text-center font-bold">Top Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopUpScreen;