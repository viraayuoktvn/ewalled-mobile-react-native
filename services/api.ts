import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
 
// Define a generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Define user registration request payload
export interface RegisterUserPayload {
  email: string;
  username: string;
  fullname: string;
  password: string;
  phoneNumber: string;
  avatarUrl?: string | null;
}

// Define login request payload
export interface LoginPayload {
  email: string;
  password: string;
}

// Define user response type
export interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullname: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

// Define login response type
export interface LoginResponse {
  message: string;
  token: string;
  userId: number;
}

// Define wallet response type
export interface WalletResponse {
  id: number;
  user: { id: number };
  userId: number;
  accountNumber: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionResponse = {
  id: number;
  walletId: number;
  transactionType: "TOP_UP" | "TRANSFER";
  amount: number;
  recipientWalletId?: number | null;
  transactionDate: string;
  description?: string;
  option?: string;
  senderName?: string;
  recipientName?: string;
};

export interface PaginatedTransactionResponse {
  content: TransactionResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiPaginatedResponse<T> {
  status: string;
  message: string;
  content: T;
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
  return await AsyncStorage.getItem("authToken");
};

// Function to register a new user
export const registerUser = async (userData: RegisterUserPayload): Promise<UserResponse> => {
  try {
    const response = await api.post<UserResponse>("/api/auth/register", userData);
    return response.data;
  } catch (error: any) {
    console.error("🚨 Registration Error:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to register user.");
  }
};

// **Login User & Handle Wallet Creation**
export const loginUserAndSetupWallet = async (email: string, password: string) => {
  try {
    console.log("🟡 Attempting login with:", email);

    // Step 1: Login User
    const loginResponse = await api.post<LoginResponse>("/api/auth/login", { email, password });
    console.log("✅ Login Successful:", loginResponse.data);

    const { token, userId } = loginResponse.data;
    if (!token || !userId) throw new Error("Invalid login response");

    // Step 2: Save Token & Set Auth Header
    await AsyncStorage.setItem("authToken", token);
    setAuthToken(token);
    console.log("🔑 Token Stored in AsyncStorage:", token);

    // Step 3: Get User Data
    const userResponse = await api.get<UserResponse>(`/api/users/${userId}`);
    const userData = userResponse.data;

    console.log("UserData: ", userData)

    if (!userData) throw new Error("User data not found.");

    // Step 4: Check Existing Wallet
    let walletData: WalletResponse | null = null;
    try {
      console.log("🔍 Checking for existing wallet...");
      const walletResponse = await api.get<ApiResponse<WalletResponse[]>>(`/api/wallets/user/${userId}`);

      const wallets = walletResponse.data.data || walletResponse.data; // ✅ Covernya dua kemungkinan
      console.log("🔎 Found wallets:", wallets);

      // Cek apakah ada wallet yang cocok dengan userId
      let userWallet = null;
      for (const wallet of wallets) {
        if (wallet.user.id === userData.id) { // FIXED: Pakai userId, bukan user.id
          userWallet = wallet;
          break; // Stop loop begitu ketemu wallet yang cocok
        }
      }

      if (userWallet) {
        console.log("💰 Wallet Found:", userWallet);
        walletData = userWallet; // FIXED: Simpan wallet yang ditemukan
      } else {
        console.log("❌ No wallet found for this user, creating one...");
        walletData = await createWallet(userId);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log("❌ Wallet Not Found, Creating New Wallet...");
        walletData = await createWallet(userId);
      } else {
        console.error("⚠️ Wallet Error:", error);
        throw new Error("Failed to check or create wallet.");
      }
    }

    return { userData, walletData };
  } catch (error: any) {
    console.error("🚨 Login Error:", error.response?.data?.message || error.message);
    throw new Error("Login failed. Please try again.");
  }
};

// **Create Wallet**
export const createWallet = async (userId: number): Promise<WalletResponse> => {
  try {
    const token = await getAuthToken();
    console.log("⚡ Creating wallet for user:", userId);
    const response = await api.post<ApiResponse<WalletResponse>>(
      `/api/wallets/${userId}`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("✅ Wallet Created:", response.data);
    const wallet = response.data?.data || response.data; // Menangani dua kemungkinan struktur response
    if (!wallet || !wallet.id) throw new Error("Invalid wallet response format");
    return wallet;

  } catch (error) {
    console.error("🚨 Create Wallet Error:", error);
    throw new Error("Failed to create wallet.");
  }
};

export const getAllWallets = async () => {
  const res = await fetch(`${API_BASE_URL}/api/wallets`);
  if (!res.ok) throw new Error("Failed to fetch wallets");
  return res.json();
};

// Get wallet by ID
export const getWalletById = async (walletId: number): Promise<WalletResponse> => {
  try {
    const token = await getAuthToken();
    setAuthToken(token);

    const response = await api.get<ApiResponse<WalletResponse>>(`/api/wallets/${walletId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const wallet = response.data?.data || response.data;
    if (!wallet || !wallet.id) throw new Error("Invalid wallet response format");

    return wallet;
  } catch (error: any) {
    console.error("🚨 Get Wallet Error:", error.response?.data?.message || error.message);
    throw new Error("Failed to fetch wallet.");
  }
};

// **Logout User**
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    setAuthToken(null);
    console.log("🚪 User Logged Out");
  } catch (error) {
    console.error("⚠️ Logout Error:", error);
  }
};

// Define transaction payload
export interface TopUpPayload {
  walletId: number;
  transactionType: "TOP_UP";
  amount: string;
  recipientAccountNumber?: string;
  description?: string;
  option: string;
}

// Function to perform top up
export const topUpWallet = async (payload: TopUpPayload): Promise<any> => {
  try {
    const token = await getAuthToken();
    setAuthToken(token);

    const response = await api.post("/api/transactions", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Top Up Successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("🚨 Top Up Error:", error.response?.data?.message || error.message);
    throw new Error("Top up failed.");
  }
};

export interface TransferPayload {
  walletId: number;
  transactionType: "TRANSFER";
  amount: string;
  recipientAccountNumber: string;
  description?: string;
}

export const transfer = async (payload: TransferPayload): Promise<any> => {
  try {
    const token = await getAuthToken();
    setAuthToken(token);

    const response = await api.post("/api/transactions", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Transfer Successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("🚨 Transfer Error:", error.response?.data?.message || error.message);
    throw new Error("Transfer failed.");
  }
};

export const getTransactionsByWalletId = async (
  walletId: number,
  options?: {
    token?: string;
    type?: "TOP_UP" | "TRANSFER";
    timeRange?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  }
): Promise<ApiResponse<PaginatedTransactionResponse>> => {
  const token = options?.token || (await getAuthToken());

  const params: Record<string, any> = {
    walletId,
    page: options?.page ?? 0,
    size: options?.size ?? 10,
    sortBy: options?.sortBy ?? "transactionDate",
    order: options?.order ?? "desc",
  };

  if (options?.type) params.type = options.type;
  if (options?.timeRange) params.timeRange = options.timeRange;

  const response = await api.get<ApiResponse<PaginatedTransactionResponse>>(
    `/api/transactions?walletId=${walletId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    }
  );

  return response.data;
};

export default api;