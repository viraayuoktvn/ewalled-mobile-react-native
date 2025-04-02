import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

// Define the user registration request payload
export interface RegisterUserPayload {
  email: string;
  username: string;
  fullname: string;
  password: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
}

// Define the login request payload
export interface LoginPayload {
  email: string;
  password: string;
}

// Define the expected user response type
export interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullname: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

// Define the login response type
export interface LoginResponse {
  message: string;
  token: string;
}

// Define a generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to set Authorization Token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Function to get the token from AsyncStorage
const getAuthToken = async () => {
  const token = await AsyncStorage.getItem("authToken");
  console.log("Token retrieved from AsyncStorage:", token); 
  return token;
};

// Function to register a new user
export const registerUser = async (userData: RegisterUserPayload): Promise<UserResponse> => {
  try {
    const token = await getAuthToken();
    console.log("Token to be sent in register request:", token); 
    console.log("Data being sent:", userData);

    const response = await api.post("/api/auth/register", userData, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    const data = response.data as ApiResponse<UserResponse>;
    return data.data;
  } catch (error: any) {
    console.error("Registration Error:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to register user.");
  }
};

export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  try {
    const response = await axios.post<LoginResponse>("http://192.168.1.8:8080/api/auth/login", {
      email,
      password,
    });

    console.log("Login Response:", response.data);

    const token = response.data.token;
    if (!token) {
      throw new Error("Token tidak ditemukan di response API");
    }

    // Store token to AsyncStorage
    await AsyncStorage.setItem("authToken", token);

    return { token };
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};


// Function to log out user
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    setAuthToken(null);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export default api;