import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import "@/global.css";
import { ThemeProvider } from '../contexts/ThemeContext'; 
import { UserProvider } from '@/contexts/UserContext';
import Navbar from '@/components/Navbar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname(); 
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  if (!loaded) return null;

  const hideNavbarOn = ['/', '/login', '/register'];
  const shouldHideNavbar = hideNavbarOn.includes(pathname);

  return (
    <UserProvider>
      <ThemeProvider value={{ isDarkMode, toggleTheme: () => setIsDarkMode(prev => !prev) }}>
        {!shouldHideNavbar && <Navbar />}
        
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />
          <Stack.Screen name="register" options={{ title: "Register", headerShown: false }} />
          <Stack.Screen name="transactions" options={{ title: "Transactions History", headerShown: false }} />
          <Stack.Screen name="proof" options={{ title: "Transfer Proof", headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </ThemeProvider>
    </UserProvider>
  );
}