import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

const TransferScreen: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  return (
    <View className="flex-1 bg-white p-6">
      {/* Header */}
      <Text className="text-xl font-bold mb-8 mt-12">Transfer</Text>

      {/* Receiver Account (To) */}
      <View className="bg-[#0061FF] p-4 left-0 right-0">
        <Text className="text-white text-lg font-bold text-left px-6">
          To: 9000008940208
        </Text>
      </View>

      {/* Amount Input */}
      <Text className="text-gray-400 mb-2 mt-8">Amount</Text>
      <View className="flex-row items-center border-b border-gray-100 pb-2 mb-2">
        <Text className="text-lg font-bold mr-2">IDR</Text>
        <TextInput
          className="flex-1 text-2xl font-bold"
          keyboardType="numeric"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Balance Info */}
      <View className="flex-row justify-between mb-6">
        <Text className="text-gray-400 text-sm">Balance</Text>
        <Text className="text-[#0061FF] text-sm">IDR 10.000.000</Text>
      </View>

      {/* Notes Input */}
      <Text className="text-gray-400 mt-10">Notes</Text>
      <TextInput
        className="border-b border-gray-100 pb-2 mb-6 text-lg"
        placeholder=""
        value={notes}
        onChangeText={setNotes}
      />

      {/* Transfer Button */}
      <TouchableOpacity className="bg-[#0061FF] p-4 rounded-lg mt-auto">
        <Text className="text-white text-center font-bold">Transfer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransferScreen;