import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

// Define the user registration request payload
export interface RegisterUserPayload {
  email: string;
  username: string;
  fullname: string;
  password: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
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
  avatarUrl: string | null;
  phoneNumber: string | null;
}

// Define the login response type
export interface LoginResponse {
  token: string;
  user: UserResponse;
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

// Function to register a new user
export const registerUser = async (userData: RegisterUserPayload): Promise<UserResponse> => {
  try {
    const response = await api.post("/api/users", userData);
    const data = response.data as ApiResponse<UserResponse>;
    return data.data;
  } catch (error: any) {
    console.error("Registration Error:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to register user.");
  }
};

export const loginUser = async ({ email, password }: LoginPayload) => {
  try {
    const response = await api.post<ApiResponse<LoginResponse>>("/api/users", { email, password });

    if (!response.data || !response.data.data.token) {
      throw new Error("Invalid login response");
    }

    const { token, user } = response.data.data;

    await AsyncStorage.setItem("authToken", token);
    setAuthToken(token);

    console.log("Login successful:", user);

    return user;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to login.");
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