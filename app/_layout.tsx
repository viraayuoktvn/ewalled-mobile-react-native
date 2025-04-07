import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import "@/global.css";
import { ThemeProvider } from '../contexts/ThemeContext'; 
import { UserProvider } from '@/contexts/UserContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  if (!loaded) {
    return null; 
  }

  return (
    <UserProvider>
    <ThemeProvider value={{ isDarkMode, toggleTheme: () => setIsDarkMode(prev => !prev) }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "Register", headerShown: false }} />
        <Stack.Screen name="transactions" options={{ title: "Transactions History", headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </UserProvider>
  );
}
