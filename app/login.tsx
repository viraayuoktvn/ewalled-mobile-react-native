import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { loginUserAndSetupWallet, UserResponse, WalletResponse } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "@/contexts/UserContext";

const { width } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { setUser, setWallet } = useUserContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {

      // Login & Wallet Setup
      const response = await loginUserAndSetupWallet(email, password);

      if (!response) {
        Alert.alert("Error", "Invalid response from server.");
        return;
      }

      const userData  = response.userData; 
      const walletData = response.walletData;

      if (!userData || Object.keys(userData).length === 0) {
        console.error("userData is empty!", userData);
        throw new Error("User data is missing.");
      }
      
      if (!walletData || Object.keys(walletData).length === 0) {
        console.error("walletData is empty!", walletData);
        throw new Error("Wallet data is missing.");
      }

      // Set User & Wallet in Context
      setUser(userData as UserResponse);
      setWallet(walletData as WalletResponse);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("walletData", JSON.stringify(walletData));

      // Redirect to Home
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login Error:", error);
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center p-10">
      <Image
        source={require("../public/images/ewalled.png")}
        className="w-[233px] h-[57px] mb-12"
      />

      {/* TextInput */}
      <View className="w-full max-w-md mb-6 mt-8">
        <TextInput
          placeholder="Email"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Password"
          className="w-full p-4 rounded-lg bg-gray-100"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        className="w-full max-w-md p-4 rounded-lg mt-4 bg-blue-600"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <View className="mt-3 flex-row items-start justify-start">
        <Text className="text-black">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text className="text-[#0061FF]">Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;