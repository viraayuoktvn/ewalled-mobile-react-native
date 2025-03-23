import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router"; // ✅ Ganti useNavigation() dengan useRouter()

const RegisterScreen = () => {
  const router = useRouter(); // ✅ Pakai router untuk navigasi

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      {/* Logo */}
      <Image source={require("../../assets/images/ewalled.png")} className="w-[233px] h-[57px] mb-12" />

      {/* Input Fields */}
      <View className="w-full mb-6 mt-12">
        <TextInput placeholder="Fullname" placeholderTextColor="black" className="w-full p-4 rounded-[10px] bg-gray-100" />
      </View>
      <View className="w-full mb-6">
        <TextInput placeholder="Email" placeholderTextColor="black" className="w-full p-4 rounded-[10px] bg-gray-100" />
      </View>
      <View className="w-full mb-6">
        <TextInput placeholder="Password" placeholderTextColor="black" secureTextEntry className="w-full p-4 rounded-[10px] bg-gray-100" />
      </View>
      <View className="w-full mb-6">
        <TextInput placeholder="Avatar URL" placeholderTextColor="black" className="w-full p-4 rounded-[10px] bg-gray-100" />
      </View>

      {/* Terms and Conditions */}
      <Text className="mt-6 text-black text-center">
        I have read and agree to the <Text className="text-[#0061FF]">Terms and Conditions</Text> <Text className="text-[#FF0000]">*</Text>
      </Text>

      {/* Register Button */}
      <TouchableOpacity className="w-full bg-[#0061FF] p-4 rounded-lg mt-4">
        <Text className="text-white text-center font-bold">Register</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <Text className="mt-4 text-black">
        Have an account?{" "}
        <Text className="text-[#0061FF]" onPress={() => router.push("/login")}>
          Login here
        </Text>
      </Text>
    </View>
  );
};

export default RegisterScreen;