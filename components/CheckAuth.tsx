import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api'; 
import { jwtDecode } from 'jwt-decode';

// Function to check if the token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    return true;
  }
};

// Function to check authentication
export const checkAuth = async (router: any) => {
  const token = await AsyncStorage.getItem('authToken');
  
  // If no token or token expired, remove it and redirect to login
  if (!token || isTokenExpired(token)) {
    await AsyncStorage.removeItem('authToken');  // Clear invalid token
    router.replace('/login');  // Redirect to login page
    return false;  // Return false since authentication failed
  }

  try {
    // Attempt to validate the token with the backend
    await api.get("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Token valid");
    return true;  // If the token is valid, proceed
  } catch (error) {
    // If the request failed (401 Unauthorized), handle it
    console.log("Token rejected by server: ", error);
    await AsyncStorage.removeItem('authToken');  // Clear the invalid token
    router.replace('/login');  // Redirect to login page
    return false;  // Return false since authentication failed
  }
};