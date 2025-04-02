import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

const API_BASE_URL = "http://192.168.1.8:8080/api/auth/register";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fullname, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log("Sending data:", { fullname, username, email, password, phoneNumber, avatarUrl });

    if (!fullname || !username || !email || !password || !phoneNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
  
    if (!isChecked) {
      Alert.alert("Error", "You must agree to the terms and conditions.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname, username, email, password, phoneNumber, avatarUrl: avatarUrl || null }),
        credentials: "include",
      });
  
      const data = await response.json();
      console.log("API Response:", data); 
  
      if (response.ok) {
        // Save user data to AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(data));
  
        const storedUserData = await AsyncStorage.getItem("userData");
        console.log("Stored User Data:", storedUserData);
  
        router.replace("/login");
      } else {
        Alert.alert("Registration Error", "Registration failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };   

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ alignItems: "center", padding: isLargeScreen ? 12 : 6 }}>
      <Image source={require("../assets/images/ewalled.png")} className="w-[233px] h-[57px] mb-24 mt-12" />

      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Fullname" className="w-full p-4 rounded-lg bg-gray-100" value={fullname} onChangeText={setFullName} />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Username" className="w-full p-4 rounded-lg bg-gray-100" value={username} onChangeText={setUsername} />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Email" className="w-full p-4 rounded-lg bg-gray-100" value={email} onChangeText={setEmail} keyboardType="email-address" />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Password" className="w-full p-4 rounded-lg bg-gray-100" secureTextEntry value={password} onChangeText={setPassword} />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Phone Number" className="w-full p-4 rounded-lg bg-gray-100" value={phoneNumber} onChangeText={setPhoneNumber} />
      </View>
      <View className="w-full max-w-md mb-6">
        <TextInput placeholder="Avatar URL (Optional)" className="w-full p-4 rounded-lg bg-gray-100" value={avatarUrl} onChangeText={setAvatarUrl} />
      </View>

      <View className="mt-6 flex-row justify-center items-center">
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)} className={`w-6 h-6 mr-2 border-2 rounded-md ${isChecked ? "bg-blue-600 border-blue-600" : "border-gray-400"}`}> 
          {isChecked && <Text className="text-white font-bold">✓</Text>}
        </TouchableOpacity>
        <Text className="text-black">I have agree to the </Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text className="text-[#0061FF]">Terms and Conditions</Text>
          </TouchableOpacity>
          <Text className="text-[#FF0000] ml-1">*</Text>
        </View>
      </View>

      {/* Modal for Terms and Conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="w-full bg-white rounded-lg h-full p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-gray-300">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-10">
                <Image source={require("../assets/images/back.png")} className="w-6 h-6" />
              </TouchableOpacity>
              <Text className="text-lg font-bold">Terms and Conditions</Text>
              <View className="w-10" />
            </View>

            {/* Scrollable Content */}
            <ScrollView style={{ maxHeight: 1000 }} className="mt-4">
            <Text className="text-black text-justify mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
              It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset 
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like 
              Aldus PageMaker including versions of Lorem Ipsum.
              </Text>
              <Text className="text-black text-justify mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
              It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset 
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like 
              Aldus PageMaker including versions of Lorem Ipsum.
              </Text>
              <Text className="text-black text-justify mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
              It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset 
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like 
              Aldus PageMaker including versions of Lorem Ipsum.
              </Text>
              <Text className="text-black text-justify mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
              It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset 
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like 
              Aldus PageMaker including versions of Lorem Ipsum.
              </Text>
              <Text className="text-black text-justify mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
              It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset 
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like 
              Aldus PageMaker including versions of Lorem Ipsum.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity className={`w-full max-w-md p-4 rounded-lg mt-4 ${isChecked ? "bg-blue-600" : "bg-gray-400"}`} disabled={!isChecked || loading} onPress={handleRegister}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-bold">Register</Text>}
      </TouchableOpacity>

      {/* Login Link */}
      <View className="mt-3 mb-3 flex-row items-start justify-start w-full max-w-md">
        <Text className="text-black">Have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-[#0061FF]">Login here</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

export default RegisterScreen;