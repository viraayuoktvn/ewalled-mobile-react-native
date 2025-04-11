import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useFonts, OpenSans_400Regular, OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import * as SplashScreen from "expo-splash-screen";
import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const { isDarkMode } = useTheme(); 
  const [fontsLoaded] = useFonts({
    OpenSans_Regular: OpenSans_400Regular,
    OpenSans_Bold: OpenSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? Colors.dark.tint : '#FFFFF',
        tabBarInactiveTintColor: isDarkMode ? '#AAAAAA' : '#FFFFFF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDarkMode ? Colors.dark.background : '#0061FF',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: { fontFamily: "OpenSans_Regular" },
      }}
    >
      <Tabs.Screen
        name="summary"
        options={{
          title: 'summary',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../public/images/bitcoin-icons_graph-filled.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: 'Summary',
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="topup"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../public/images/tabler_moneybag-plus.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: 'Top Up',
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'dashboard',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../public/images/material-symbols_dashboard.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: 'Dashboard',
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../public/images/rivet-icons_transfer-alt.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: 'Transfer',
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="signout"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../public/images/fa_sign-out.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
          tabBarLabel: 'Sign Out',
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
    </Tabs>
  );
}