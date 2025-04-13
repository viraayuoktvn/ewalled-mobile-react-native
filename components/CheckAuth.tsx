// utils/checkAuth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
  
  if (!token || isTokenExpired(token)) {
    await AsyncStorage.removeItem('authToken'); // remove invalid token
    router.replace('/login');
  }
};
