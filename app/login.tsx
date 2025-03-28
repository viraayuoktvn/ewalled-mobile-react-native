import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      {/* Logo */}
      <Image source={require("../assets/images/ewalled.png")} className="w-[233px] h-[57px] mb-12" />

      {/* Input Fields */}
      <View className="w-full mb-6 mt-12">
        <TextInput
          placeholder="Email"
          className="w-full p-4 rounded-[10px] bg-gray-100"
          value={email}
          onChangeText={(text: string) => setEmail(text)}
        />
      </View>
      <View className="w-full mb-12">
        <TextInput
          placeholder="Password"
          secureTextEntry
          className="w-full p-4 rounded-[10px] bg-gray-100"
          value={password}
          onChangeText={(text: string) => setPassword(text)}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity
        className="w-full bg-[#0061FF] p-4 rounded-lg mt-12"
        onPress={() => router.replace("/(tabs)")}
      >
        <Text className="text-white text-center font-bold">Login</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <Text className="mt-4 text-black flex self-start">
        Don’t have an account?{" "}
        <Text className="text-[#0061FF]" onPress={() => router.push("/register")}>
          Register here
        </Text>
      </Text>
    </View>
  );
};

export default LoginScreen;