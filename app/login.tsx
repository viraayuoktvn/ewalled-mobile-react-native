import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../services/api";

const { width } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const router = useRouter();
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
      const response = await loginUser({ email, password });
  
      if (response && response.token) {
        await AsyncStorage.setItem("authToken", response.token);
  
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Image
        source={require("../assets/images/ewalled.png")}
        className="w-[233px] h-[57px] mb-12 "
      />

      {/* TextInput */}
      <View className="w-full max-w-md mb-6 mt-8">
        <TextInput placeholder="Email" className="w-full p-4 rounded-lg bg-gray-100" value={email} onChangeText={setEmail} keyboardType="email-address" />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Password" className="w-full p-4 rounded-lg bg-gray-100" secureTextEntry value={password} onChangeText={setPassword} />
      </View>

      <TouchableOpacity 
        className="w-full max-w-md p-4 rounded-lg mt-4 bg-blue-600" 
        onPress={handleLogin}
        disabled={loading}> 
        <Text className="text-white text-center font-bold">Login</Text>
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