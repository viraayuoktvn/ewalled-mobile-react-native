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
import { registerUser } from "@/services/api";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

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

  const [errors, setErrors] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    avatarUrl: "",
  });

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
      const newUser = await registerUser({
        fullname,
        username,
        email,
        password,
        phoneNumber,
        avatarUrl: avatarUrl || null,
      });
  
      console.log("Registration Success:", newUser);
  
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));
  
      // Redirect ke halaman login
      router.replace("/login");
    } catch (error: any) {
      console.error("🚨 Registration Failed:", error.message);
      Alert.alert("❌ Registration Error", error.message || "Failed to register user.");
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (name: string, value: string) => {
    let errorMessage = "";
  
    switch (name) {
      case "fullname":
        if (!value) errorMessage = "Full Name is required";
        break;
  
      case "username":
        if (!value) errorMessage = "Username is required";
        break;
  
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errorMessage = "Email is required";
        } else if (!emailRegex.test(value)) {
          errorMessage = "Invalid email format";
        }
        break;
  
      case "password":
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,32}$/;
        if (!value) {
          errorMessage = "Password is required";
        } else if (value.length < 8 || value.length > 32) {
          errorMessage = "Password must be between 8 and 32 characters";
        } else if (!passwordRegex.test(value)) {
          errorMessage = "Password must contain uppercase, lowercase, digit, and special character (!@#$%^&*)";
        }
        break;
  
      case "phoneNumber":
        const phoneRegex = /^0\d{9,12}$/;
        if (!value) {
          errorMessage = "Phone Number is required";
        } else if (!phoneRegex.test(value)) {
          errorMessage = "Phone number must start with 0 and be 10 to 13 digits long";
        }
        break;
  
      case "avatarUrl":
        const urlRegex = /^http:\/\/.*/;
        if (value && !urlRegex.test(value)) {
          errorMessage = "Avatar URL must start with http://";
        }
        break;
  
      default:
        break;
    }
  
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };
  

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ alignItems: "center", padding: isLargeScreen ? 12 : 6 }}>
      <Image source={require("../public/images/ewalled.png")} className="w-[233px] h-[57px] mb-24 mt-12" />

      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Fullname"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={fullname}
          onChangeText={(text) => {
            setFullName(text);
            validateInput("fullname", text);
          }}
          onBlur={() => validateInput("fullname", fullname)}
        />
        {errors.fullname ? <Text className="text-[#FF0000] mt-1 ml-2">{errors.fullname}</Text> : null}
      </View>

      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Username"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            validateInput("username", text);
          }}
          onBlur={() => validateInput("username", username)}
        />
        {errors.username ? <Text className="text-[#FF0000] mt-1 ml-2">{errors.username}</Text> : null}
      </View>

      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Email"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateInput("email", text);
          }}
          onBlur={() => validateInput("email", email)}
          keyboardType="email-address"
        />
        {errors.email ? <Text className="text-[#FF0000] mt-1 ml-2">{errors.email}</Text> : null}
      </View>

      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Password"
          className="w-full p-4 rounded-lg bg-gray-100"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validateInput("password", text);
          }}
          onBlur={() => validateInput("password", password)}
        />
        {errors.password ? <Text className="text-[#FF0000] mt-1 ml-2">{errors.password}</Text> : null}
      </View>

      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Phone Number"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            validateInput("phoneNumber", text);
          }}
          onBlur={() => validateInput("phoneNumber", phoneNumber)}
          keyboardType="phone-pad"
        />
        {errors.phoneNumber ? <Text className="text-[#FF0000] mt-1 ml-2">{errors.phoneNumber}</Text> : null}
      </View>

      <View className="w-full max-w-md mb-6">
        <TextInput
          placeholder="Avatar URL (Optional)"
          className="w-full p-4 rounded-lg bg-gray-100"
          value={avatarUrl}
          onChangeText={(text) => {
            setAvatarUrl(text);
            validateInput("avatarUrl", text);
          }}
          onBlur={() => validateInput("avatarUrl", avatarUrl)}
        />
        {errors.avatarUrl ? <Text className="text-[#FF0000] mt-1 ml-2">{errors.avatarUrl}</Text> : null}
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
                <Image source={require("../public/images/back.png")} className="w-6 h-6" />
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