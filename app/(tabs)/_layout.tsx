import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useFonts, OpenSans_400Regular, OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import * as SplashScreen from "expo-splash-screen";
import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

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

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;
          let label: string;

          switch (route.name) {
            case 'summary':
              iconName = 'bar-chart-2';
              label = 'Summary';
              break;
            case 'topup':
              iconName = 'plus';
              label = 'Top Up';
              break;
            case 'index':
              iconName = 'grid';
              label = 'Dashboard';
              break;
            case 'transfer':
              iconName = 'send';
              label = 'Transfer';
              break;
            case 'signout':
              iconName = 'log-out';
              label = 'Sign Out';
              break;
            default:
              iconName = 'circle';
              label = '';
          }

          return (
            <View
              style={{
                backgroundColor: focused && !isDarkMode ? 'rgba(255,255,255,0.2)' : 'transparent',
                paddingVertical: 3,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                width: 70, 
                height: 70,
              }}
            >
              <Feather name={iconName} size={size} color={color} />
              <Text
                style={{
                  fontFamily: "OpenSans_Bold",
                  fontSize: 9, 
                  color,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
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
