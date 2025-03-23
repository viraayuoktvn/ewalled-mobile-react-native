import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";

const TopUpScreen: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("BYOND Pay");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  return (
    <View className="flex-1 bg-white p-6">
      {/* Header */}
      <Text className="text-xl font-bold mb-12 mt-12">Top Up</Text>

      {/* Wrapper untuk konten agar tombol di bawah */}
      <View className="flex-grow">
        {/* Amount Input */}
        <Text className="text-gray-400 mb-2">Amount</Text>
        <View className="flex-row items-center border-b border-gray-100 pb-2 mb-12">
          <Text className="text-lg font-bold mr-2">IDR</Text>
          <TextInput
            className="flex-1 text-2xl font-bold"
            keyboardType="numeric"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Payment Method */}
        <Text className="text-gray-400 mb-3">Payment Method</Text>
        <View className="rounded-lg mb-12">
          <Picker
            selectedValue={selectedMethod}
            onValueChange={(itemValue: string) => setSelectedMethod(itemValue)}
          >
            <Picker.Item label="BYOND Pay" value="BYOND Pay" />
            <Picker.Item label="Bank Transfer" value="Bank Transfer" />
            <Picker.Item label="Credit Card" value="Credit Card" />
          </Picker>
        </View>

        {/* Notes Input */}
        <Text className="text-gray-400 mb-2">Notes</Text>
        <TextInput
          className="border-b border-gray-100 pb-2 mb-6"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Submit Button (Pindah ke bawah) */}
      <TouchableOpacity className="bg-[#0061FF] p-4 rounded-lg" style={{ marginTop: "auto" }}>
        <Text className="text-white text-center font-bold">Top Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopUpScreen;