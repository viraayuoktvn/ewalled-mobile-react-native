import { View, Text, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext"; 

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768; 

const TransferScreen: React.FC = () => {
  const { isDarkMode } = useTheme(); 
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-6`}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* Header */}
      <Text className={`text-xl font-bold mb-6 mt-12 ${isDarkMode ? "text-white" : "text-black"} w-full max-w-md`}>
        Transfer
      </Text>

      {/* Receiver Account (To) */}
      <View
        className="w-full max-w-md bg-[#0061FF]"
        style={{
          justifyContent: "center",
          alignItems: "center", 
          height: 60, 
        }}
      >
        <Text className={`text-lg font-bold text-center ${isDarkMode ? "text-white" : "text-white"}`}>
          To: 9000008940208
        </Text>
      </View>

      {/* Amount Input */}
      <Text className={`text-gray-400 mb-2 mt-8 w-full max-w-md text-left ${isDarkMode ? "text-white" : "text-black"}`}>
        Amount
      </Text>
      <View className={`flex-row items-center border-b pb-2 mb-2 w-full max-w-md ${isDarkMode ? "border-gray-100" : "border-gray-300"}`}>
        <Text className={`text-lg mr-2 self-start ${isDarkMode ? "text-white" : "text-black"}`}>IDR</Text>
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
      <View className={`flex-row justify-between mb-4 w-full max-w-md ${isDarkMode ? "text-white" : "text-black"}`}>
        <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>Balance</Text>
        <Text className="text-[#0061FF] text-sm">IDR 10.000.000</Text>
      </View>

      {/* Notes Input */}
      <Text className={`text-gray-400 mt-8 mb-4 w-full max-w-md text-left ${isDarkMode ? "text-white" : "text-black"}`}>
        Notes
      </Text>
      <TextInput
        className={`border-b mb-6 text-lg w-full max-w-md ${isDarkMode ? "border-gray-100" : "border-gray-300"}`}
        placeholder=""
        value={notes}
        onChangeText={setNotes}
        style={{
          color: isDarkMode ? "white" : "black", 
        }}
      />

      {/* Transfer Button */}
      <TouchableOpacity
        className="p-4 rounded-lg mt-auto w-full max-w-md bg-[#0061FF]"
        style={{
          justifyContent: "center", 
          alignItems: "center", 
        }}
      >
        <Text className="text-white text-center font-bold">Transfer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransferScreen;