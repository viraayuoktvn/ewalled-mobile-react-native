import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
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
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: isDarkMode ? Colors.dark.tint : '#FFFFFF',
        tabBarInactiveTintColor: isDarkMode ? '#AAAAAA' : '#FFFFFF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDarkMode ? Colors.dark.background : '#0061FF',
          borderTopWidth: 0,
          paddingTop: 35,
          paddingBottom: 35,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;
          let label;

          switch (route.name) {
            case 'summary':
              iconSource = require('../../public/images/bitcoin-icons_graph-filled.png');
              label = 'Summary';
              break;
            case 'topup':
              iconSource = require('../../public/images/tabler_moneybag-plus.png');
              label = 'Top Up';
              break;
            case 'index':
              iconSource = require('../../public/images/material-symbols_dashboard.png');
              label = 'Dashboard';
              break;
            case 'transfer':
              iconSource = require('../../public/images/rivet-icons_transfer-alt.png');
              label = 'Transfer';
              break;
            case 'signout':
              iconSource = require('../../public/images/fa_sign-out.png');
              label = 'Sign Out';
              break;
            default:
              iconSource = undefined;
              label = '';
          }

          return (
            <View style={{
              backgroundColor: focused && !isDarkMode ? 'rgba(255,255,255,0.2)' : 'transparent',
              paddingVertical: 20,
              paddingHorizontal: 5,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 100
            }}>
              <Image
                source={iconSource}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode="contain"
              />
              <Text style={{
                fontFamily: "OpenSans_Bold",
                fontSize: 11,
                color,
                marginTop: 4
              }}>{label}</Text>
            </View>
          );
        },
        tabBarLabel: () => null,
      })}
    >
      <Tabs.Screen name="summary" />
      <Tabs.Screen name="topup" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transfer" />
      <Tabs.Screen name="signout" />
    </Tabs>
  );
}