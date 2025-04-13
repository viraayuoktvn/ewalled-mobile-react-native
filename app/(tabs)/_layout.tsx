import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Tabs, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts, OpenSans_400Regular, OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import * as SplashScreen from "expo-splash-screen";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { checkAuth } from "@/components/CheckAuth";  // Import checkAuth function

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    OpenSans_Regular: OpenSans_400Regular,
    OpenSans_Bold: OpenSans_700Bold,
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth(router);  // Ensure you call the checkAuth function here

      if (!isAuthenticated) {
        setLoading(false);  // Stop loading if the user is redirected
        return;
      }

      setLoading(false);  // If the user is authenticated, stop loading
    };

    verifyAuth();  // Call the function to verify the authentication
  }, []);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (loading || !fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: isDarkMode ? Colors.dark.tint : "#FFFFFF",
        tabBarInactiveTintColor: isDarkMode ? "#AAAAAA" : "#FFFFFF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDarkMode ? Colors.dark.background : "#0061FF",
          borderTopWidth: 0,
          paddingTop: 35,
          paddingBottom: 35,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;
          let label: string;

          switch (route.name) {
            case "summary":
              iconName = "bar-chart-2";
              label = "Summary";
              break;
            case "topup":
              iconName = "plus";
              label = "Top Up";
              break;
            case "index":
              iconName = "grid";
              label = "Dashboard";
              break;
            case "transfer":
              iconName = "send";
              label = "Transfer";
              break;
            case "signout":
              iconName = "log-out";
              label = "Sign Out";
              break;
            default:
              iconName = "circle";
              label = "";
          }

          return (
            <View
              style={{
                backgroundColor: focused && !isDarkMode ? "rgba(255,255,255,0.2)" : "transparent",
                paddingVertical: 3,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
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
                  textAlign: "center",
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
