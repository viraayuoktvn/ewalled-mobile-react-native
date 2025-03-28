import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      {/* Logo */}
      <Image
        source={require("../assets/images/ewalled.png")}
        className="w-[233px] h-[57px] mb-12"
      />

      {/* Input Fields */}
      <View className="w-full mb-6 mt-12">
        <TextInput
          placeholder="Fullname"
          placeholderTextColor="black"
          className="w-full p-4 rounded-[10px] bg-gray-100"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>
      <View className="w-full mb-6">
        <TextInput
          placeholder="Email"
          placeholderTextColor="black"
          className="w-full p-4 rounded-[10px] bg-gray-100"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View className="w-full mb-6">
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry
          className="w-full p-4 rounded-[10px] bg-gray-100"
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View className="w-full mb-6">
        <TextInput
          placeholder="Avatar URL"
          placeholderTextColor="black"
          className="w-full p-4 rounded-[10px] bg-gray-100"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
        />
      </View>

      {/* Terms and Conditions Checkbox */}
      <View className="mt-6 flex-row justify-center items-center">
        <TouchableOpacity
          onPress={() => setIsChecked(!isChecked)}
          className={`w-6 h-6 mr-2 border-2 rounded-md ${
            isChecked ? "bg-[#0061FF] border-[#0061FF]" : "border-gray-400"
          } flex justify-center items-center`}
        >
          {isChecked && <Text className="text-white font-bold">✓</Text>}
        </TouchableOpacity>
        <Text className="text-black">I have read and agree to the </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text className="text-[#0061FF]">Terms and Conditions</Text>
        </TouchableOpacity>
        <Text className="text-[#FF0000]"> *</Text>
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

      {/* Register Button */}
      <TouchableOpacity
        className={`w-full p-4 rounded-lg mt-4 ${
          isChecked ? "bg-[#0061FF]" : "bg-gray-400"
        }`}
        disabled={!isChecked}
        onPress={() => router.push("/login")}
      >
        <Text className="text-white text-center font-bold">Register</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <Text className="mt-4 text-black self-start">
        Have an account?{" "}
        <Text className="text-[#0061FF]" onPress={() => router.push("/login")}>
          Login here
        </Text>
      </Text>
    </View>
  );
};

export default RegisterScreen;
