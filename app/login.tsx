import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  loginUserAndSetupWallet,
  UserResponse,
  WalletResponse,
} from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "@/contexts/UserContext";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { setUser, setWallet } = useUserContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const showCustomModal = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomModal("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUserAndSetupWallet(email, password);

      if (!response) {
        showCustomModal("Invalid response from server.");
        return;
      }

      const userData = response.userData;
      const walletData = response.walletData;

      if (!userData || Object.keys(userData).length === 0) {
        console.error("userData is empty!", userData);
        throw new Error("User data is missing.");
      }

      if (!walletData || Object.keys(walletData).length === 0) {
        console.error("walletData is empty!", walletData);
        throw new Error("Wallet data is missing.");
      }

      setUser(userData as UserResponse);
      setWallet(walletData as WalletResponse);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("walletData", JSON.stringify(walletData));

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login Error:", error);

      if (
        error?.response?.status === 401 ||
        error?.message?.toLowerCase().includes("unauthorized") ||
        error?.message?.toLowerCase().includes("invalid")
      ) {
        showCustomModal("Incorrect email or password.");
      } else {
        showCustomModal(error.message || "Something went wrong. Please try again.");
      }
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

      {/* Input field */}
      <View className="w-full max-w-md mb-6 mt-8">
        <TextInput
          id="input-email"
          placeholder="Email"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View className="w-full max-w-md mb-6">
        <View className="flex-row items-center bg-gray-100 rounded-lg">
          <TextInput
            id="input-password"
            placeholder="Password"
            className="flex-1 p-4"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            id="btn-hide-password"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              className="px-5"
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Button login */}
      <TouchableOpacity
        id="btn-login"
        className="w-full max-w-md p-4 rounded-lg mt-4 bg-blue-600"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Register if don't have an account */}
      <View className="mt-3 flex-row items-start justify-start">
        <Text className="text-black">Don't have an account? </Text>
        <TouchableOpacity id="text-register" onPress={() => router.push("/register")}>
          <Text className="text-[#0061FF]">Register here</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Modal */}
      <Modal transparent={true} visible={showModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
            <Text className="text-black text-base text-center mb-4">{modalMessage}</Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-2 rounded-full"
              onPress={() => setShowModal(false)}
            >
              <Text className="text-white font-semibold text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;
