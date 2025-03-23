import { Image, TouchableOpacity, Text, View, ScrollView } from "react-native";
import { useState } from "react";
import { useColorScheme } from "nativewind";

const Dashboard: React.FC = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);

  interface Transaction {
    name: string;
    type: string;
    amount: string;
  }

  const transactions: Transaction[] = [
    { name: "Adityo Gizwanda", type: "Transfer", amount: "- 75.000,00" },
    { name: "Adityo Gizwanda", type: "Topup", amount: "+ 75.000,00" },
    { name: "Adityo Gizwanda", type: "Transfer", amount: "- 75.000,00" },
    { name: "Adityo Gizwanda", type: "Transfer", amount: "- 75.000,00" },
  ];

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? "bg-[#272727]" : "bg-white"} p-4`}>
      {/* Profile & Theme Toggle */}
      <View className="mt-10 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/images/avatar.png")}
            className="w-12 h-12 rounded-full border-4 border-[#178F8D] mr-2"
          />
          <View>
            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg`}>
              Chelsea Immanuela
            </Text>
            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Personal Account</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setIsDarkMode(!isDarkMode);
            setColorScheme(isDarkMode ? "light" : "dark");
          }}
        >
          <Image source={require("../../assets/images/sun.png")} className="w-8 h-8" />
        </TouchableOpacity>
      </View>

      {/* Greeting Section */}
      <View className="mt-6 flex-row justify-between items-center">
        <View>
          <Text className={`${isDarkMode ? "text-white" : "text-black"} text-xl font-bold`}>
            Good Morning, Chelsea
          </Text>
          <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
            Check all your incoming and outgoing transactions here
          </Text>
        </View>
        <Image
          source={
            isDarkMode
              ? require("../../assets/images/moon-face.png")
              : require("../../assets/images/sun-face.png")
          }
          className="w-12 h-12"
        />
      </View>

      {/* Account Number */}
      <View className="mt-4 bg-[#0061FF] p-4 rounded-[10px] flex-row justify-between items-center shadow-md shadow-[#19918F]">
        <Text className="text-white">Account No.</Text>
        <Text className="text-white font-bold text-lg">100899</Text>
      </View>

      {/* Balance Section */}
      <View className={`mt-4 p-4 ${isDarkMode ? "bg-[#272727]" : "bg-white"} rounded-2xl flex-row justify-between items-center`}>
        <View>
          <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Balance</Text>
          <View className="flex-row items-center">
            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-2xl font-bold`}>
              {isBalanceHidden ? "***************" : "Rp 10.000.000"}
            </Text>
            <TouchableOpacity onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
              <Image source={require("../../assets/images/view.png")} className="ml-3" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex items-end">
          <TouchableOpacity className="bg-blue-500 p-2 rounded-[10px] mb-3 shadow-md shadow-[#19918F]">
            <Image source={require("../../assets/images/plus.png")} className="w-8 h-8" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-[10px] shadow-md shadow-[#19918F]">
            <Image source={require("../../assets/images/share.png")} className="w-8 h-8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History */}
      <View className={`mt-4 p-4 ${isDarkMode ? "bg-[#272727]" : "bg-white"} rounded-lg`}>
        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold mb-4`}>
          Transaction History
        </Text>
        <View className="h-[1px] bg-gray-300 w-full mb-3" />
        {transactions.map((item, i) => (
          <View
            key={i}
            className="flex-row justify-between items-center border-b border-gray-300 py-3"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
              <View>
                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                  {item.name}
                </Text>
                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.type}</Text>
                <Text className="text-gray-500 text-xs">08 December 2024</Text>
              </View>
            </View>
            <Text
              className={`${
                item.amount.startsWith("-") ? (isDarkMode ? "text-white" : "text-black") : "text-green-500"
              } font-bold`}
            >
              {item.amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Dashboard;