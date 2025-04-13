import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
 
// Define a generic API response type
export interface ApiResponse<T> {
  status: string;
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
  token: string;
}

// Define wallet response type
export interface WalletResponse {
  id: number;
  user: { id: number, fullname: string };
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
  senderAccountNumber?: string;
  senderFullname?: string;
  receiverAccountNumber?: string;
  receiverFullname?: string;
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

export interface TransferPayload {
  walletId: number;
  transactionType: "TRANSFER";
  amount: string;
  recipientAccountNumber: string;
  description?: string;
}

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
  data: {
    content: T; 
  };
  status: string;
  message: string;
  content: T;
}

// Wallet Summary DTO
export interface WalletSummaryDTO {
  totalIncome: number;
  totalOutcome: number;
  balance: number;
}

export interface BalanceGraphResponse {
  label: string;
  income: number;
  outcome: number;
  incomePercent: number;
  outcomePercent: number;
}

export interface BalanceGraphResult {
  walletId: number;
  view: string;
  year: number;
  month: string;
  maxValue: number;
  data: BalanceGraphResponse[];
}

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
  const response = await api.post<ApiResponse<UserResponse>>("/api/auth/register", userData);
  return response.data.data;
};

// **Login User & Handle Wallet Creation**
export const loginUserAndSetupWallet = async (email: string, password: string) => {
  const loginResponse = await api.post<ApiResponse<LoginResponse>>("/api/auth/login", { email, password });
  const token = loginResponse.data.data.token;
  await AsyncStorage.setItem("authToken", token);
  setAuthToken(token);

  const userResponse = await api.get<ApiResponse<UserResponse>>(`/api/users/me`);
  const userData = userResponse.data.data;
  const userId = userData.id;

  const walletResponse = await api.get<ApiResponse<WalletResponse[]>>(`/api/wallets/user/${userId}`);
  const wallets = walletResponse.data.data;
  const userWallet = wallets.find(wallet => wallet.user.id === userId);

  const walletData = userWallet || await createWallet(userId);
  return { userData, walletData };
};

export const getCurrentUser = async (token: string) => {
  return api.get<{ data: UserResponse }>("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// **Create Wallet**
export const createWallet = async (userId: number): Promise<WalletResponse> => {
  const token = await getAuthToken();
  const response = await api.post<ApiResponse<WalletResponse>>(`/api/wallets/${userId}`, { userId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const getAllWallets = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error("Token required");

  const res = await api.get<ApiResponse<WalletResponse[]>>("/api/wallets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.data.status === "success" && Array.isArray(res.data.data)) {
    return res.data.data;
  }

  throw new Error(res.data.message || "Failed to fetch wallets");
};

// Get wallet by ID
export const getWalletById = async (walletId: number): Promise<WalletResponse> => {
  const token = await getAuthToken();
  setAuthToken(token);
  const response = await api.get<ApiResponse<WalletResponse>>(`/api/wallets/${walletId}`);
  return response.data.data;
};

export const getWalletByUserId = async (userId: number, token: string) => {
  return api.get<ApiResponse<WalletResponse[]>>(`/api/wallets/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// **Logout User**
export const logoutUser = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("authToken");

    if (token) {
      const response = await api.post(
        "/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        console.log("Logged out from server.");
      } else {
        console.warn("Server logout failed:", response.data.message);
        return false;
      }
    }

    await AsyncStorage.removeItem("authToken");
    setAuthToken(null);

    console.log("Logged out locally.");
    return true;

  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};


// Function to perform top up
export const topUpWallet = async (payload: TopUpPayload): Promise<TransactionResponse> => {
  const token = await getAuthToken();
  setAuthToken(token);
  const response = await api.post<ApiResponse<TransactionResponse>>("/api/transactions", payload);
  return response.data.data;
};

export const transfer = async (payload: TransferPayload): Promise<TransactionResponse> => {
  const token = await getAuthToken();
  setAuthToken(token);
  const response = await api.post<ApiResponse<TransactionResponse>>("/api/transactions", payload);
  return response.data.data;
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
): Promise<PaginatedTransactionResponse> => {
  const token = options?.token || (await getAuthToken());

  const params: Record<string, any> = {
    walletId,
    page: options?.page ?? 0,
    size: options?.size ?? 100,
    sortBy: options?.sortBy ?? "transactionDate",
    order: options?.order ?? "desc",
  };

  if (options?.type) params.type = options.type;
  if (options?.timeRange) params.timeRange = options.timeRange;

  const response = await api.get<ApiResponse<PaginatedTransactionResponse>>(
    `/api/transactions?walletId=${walletId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    }
  );

  return response.data.data;
};

// 🔍 Get Wallet Summary
export const getWalletSummary = async (walletId: number): Promise<WalletSummaryDTO> => {
  const token = await getAuthToken();
  setAuthToken(token);
  const response = await api.get<ApiResponse<WalletSummaryDTO>>(`/api/transactions/summary/${walletId}`);
  return response.data.data;
};

// 📊 Get Balance Graph
export const getBalanceGraph = async (params: {
  view: "quartal" | "monthly" | "weekly";
  year: number;
  month?: string;
  walletId: number;
}): Promise<BalanceGraphResult> => {
  const token = await getAuthToken();
  setAuthToken(token);
  const response = await api.post<ApiResponse<BalanceGraphResult>>("/api/transactions/graph", params);
  return response.data.data;
};

// Download Transaction Proof
export const downloadTransactionProof = async (transactionId: number, token: string) => {
  const url = `${API_BASE_URL}/api/transactions/export-pdf/${transactionId}`;
  const headers = { Authorization: `Bearer ${token}` };

  if (Platform.OS === "web") {
    const response = await axios.get(url, {
      headers,
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `transaction-${transactionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      FileSystem.documentDirectory + `transaction-${transactionId}.pdf`,
      { headers }
    );
    const result = await downloadResumable.downloadAsync();
    if (result?.uri) {
      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      } else {
        await WebBrowser.openBrowserAsync(result.uri);
      }
    } else {
      throw new Error("❌ Gagal mendownload file PDF.");
    }
  }
};

export default api;