import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useFonts, OpenSans_400Regular, OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import * as SplashScreen from "expo-splash-screen";
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[isDarkMode ? 'dark' : 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[isDarkMode ? 'dark' : 'light'].background,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: { fontFamily: "OpenSans_Regular" },
      }}
    >

      <Tabs.Screen
        name="topup"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../../public/images/plus.png')} 
              style={{ width: size, height: size, tintColor: color }} 
              resizeMode="contain"
            />
          ),
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />, 
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../../public/images/share.png')} 
              style={{ width: size, height: size, tintColor: color }} 
              resizeMode="contain"
            />
          ),
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
      <Tabs.Screen
        name="signout"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../public/images/logout.png')}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
          tabBarLabelStyle: { fontFamily: "OpenSans_Bold" }
        }}
      />
    </Tabs>
  );
}