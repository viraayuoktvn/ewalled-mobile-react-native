import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser } from "@/services/api";
import { Feather, FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false); 
  const [alertMessage, setAlertMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [fullname, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!fullname || !username || !email || !password || !phoneNumber) {
      setAlertMessage("Please fill in all required fields");
      setModalVisible(true);
      return;
    }
  
    if (!isChecked) {
      setAlertMessage("You must agree to the terms and conditions.");
      setModalVisible(true);
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
  
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));
  
      // Redirect to login page
      router.replace("/login");
    } catch (error: any) {
      console.error("Registration Failed:", error.message);
  
      let userFriendlyMessage = "Something went wrong. Please try again later.";
  
      if (error.message.includes("409")) {
        userFriendlyMessage = "This email or username is already taken. Please choose another.";
      } else if (error.message.includes("400")) {
        userFriendlyMessage = "Please check your input and try again.";
      } else if (error.message.includes("500")) {
        userFriendlyMessage = "Server error. Please try again later.";
      }
  
      setAlertMessage(userFriendlyMessage);  // Display the customized message
      setModalVisible(true);
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
          errorMessage = "Email cannot be empty";
        } else if (!emailRegex.test(value)) {
          errorMessage = "Invalid email format";
        }
        break;
  
      case "password":
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,32}$/;
        if (!value) {
          errorMessage = "Password cannot be empty";
        } else if (value.length < 8 || value.length > 32) {
          errorMessage = "Password must be between 8 and 32 characters";
        } else if (!passwordRegex.test(value)) {
          errorMessage = "Password must contain uppercase, lowercase, digit, and special character (!@#$%^&*)";
        }
        break;
  
      case "phoneNumber":
        const phoneRegex = /^0\d{9,12}$/;
        if (!value) {
          errorMessage = "Phone Number cannot be empty";
        } else if (!phoneRegex.test(value)) {
          errorMessage = "Phone number must start with 0 and be 10 to 13 digits long";
        }
        break;
  
      case "avatarUrl":
        const urlRegex = /^http:\/\/.*/;
        if (value && !urlRegex.test(value)) {
          errorMessage = "Avatar URL must start with https://";
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
    <ScrollView className="flex-1 bg-white p-10" contentContainerStyle={{ alignItems: "center", padding: isLargeScreen ? 12 : 6 }}>
      <Image source={require("../public/images/ewalled.png")} className="w-[233px] h-[57px] mb-24 mt-12" />

      {/* Input field */}
      <View className="w-full max-w-md mb-6">
        <TextInput
          id="input-fullname"
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
          id="input-username"
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
          id="input-email"
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
        <View className="flex-row items-center bg-gray-100 rounded-lg">
          <TextInput
            id="input-password"
            placeholder="Password"
            className="flex-1 p-4"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              validateInput("password", text);
            }}
            onBlur={() => validateInput("password", password)}
          />
          <TouchableOpacity id="btn-show-password" onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              className="px-5"
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text className="text-[#FF0000] mt-1 ml-2">{errors.password}</Text>
        ) : null}
      </View>

      <View className="w-full max-w-md mb-6">
        <TextInput
          id="input-phonenumber"
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
          id="input-avatarurl"
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
      
      {/* Checkbox */}
      <View className="mt-6 flex-row justify-center items-center">
        <TouchableOpacity
          onPress={() => setIsChecked(!isChecked)}
          className="mr-2"
        >
          <FontAwesome
            name={isChecked ? "check-square" : "square-o"}
            size={24}
            color={isChecked ? "#2563EB" : "#9CA3AF"} 
          />
        </TouchableOpacity>
        <Text className="text-black">I have agreed to the </Text>
        <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
          <Text className="text-[#0061FF]">Terms and Conditions</Text>
        </TouchableOpacity>
        <Text className="text-[#FF0000] ml-1">*</Text>
      </View>

      {/* Modal for Terms and Conditions */}
      <Modal
        id="modal-tnc"
        animationType="slide"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-6">
          <View className="w-full bg-white rounded-lg h-full p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-gray-300">
              <TouchableOpacity id="btn-back" onPress={() => setTermsModalVisible(false)}>
                <Feather name="arrow-left" size={24} color= "black" />
              </TouchableOpacity>
              <Text className="text-lg font-bold">Terms and Conditions</Text>
            <View className="w-10" />
          </View>

            {/* Scrollable Content */}
            <ScrollView style={{ maxHeight: 1000 }} className="mt-4">
              <Text className="text-black text-justify mb-4">
              Please read these terms and conditions ("terms and conditions", "terms") 
              carefully before using Walled mobile application ("app", "service") operated 
              by Walled ("us", "we", "our").
              </Text>
              <Text className="text-black font-bold text-justify mb-4">
              1. Conditions of use
              </Text>
              <Text className="text-black text-justify mb-4">
              By using this app, you certify that you have read and reviewed this Agreement and that you agree to comply 
              with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to stop using 
              the app accordingly. Walled only grants use and access of this app, its products, and its services to those who 
              have accepted its terms.
              </Text>
              <Text className="text-black font-bold text-justify mb-4">
              2. Privacy policy
              </Text>
              <Text className="text-black text-justify mb-4">
              Before you continue using our app, we advise you to read our privacy policy regarding our user data collection. 
              It will help you better understand our practices.
              </Text>              
              <Text className="text-black font-bold text-justify mb-4">
              3. Intellectual property
              </Text>
              <Text className="text-black text-justify mb-4">
              You agree that all materials, products, and services provided on this app are the property of Walled, its affiliates, 
              directors, officers, employees, agents, suppliers, or licensors, including all copyrights, trademaDecrks, trade secrets, 
              patents, and other intellectual property. You also agree that you will not reproduce or redistribute Walled’s intellectual 
              property in any way, including electronic, digital, or new trademark registrations.
              </Text>
              <Text className="text-black text-justify mb-4">
              Any unauthorized use of the materials or content appearing on the app may violate copyright, trademark, and other applicable 
              laws and could result in criminal or civil penalties.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
            <Text className="text-black text-base text-center mb-4">{alertMessage}</Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-2 rounded-full"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white font-semibold text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Register Button */}
      <TouchableOpacity
        className={`w-full max-w-md p-4 rounded-lg mt-4 ${isChecked ? "bg-blue-600" : "bg-gray-400"}`}
        disabled={!isChecked || loading}
        onPress={handleRegister}
      >
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
