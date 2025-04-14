import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingTop: 15,
        paddingBottom: 5,
        backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
      }}
    > 
    {/* Logo app */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Image
            id='logo-ewalled'
            source={require('../public/images/ewalled.png')}
            style={{ width: 160, height: 60 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Change dark/light mode */}
      <TouchableOpacity onPress={toggleTheme} style={{ marginTop: 20 }}>
        <Feather
          id='theme-mode'
          name={isDarkMode ? "moon" : "sun"}
          size={30}
          color={isDarkMode ? "white" : "orange"} 
        />
      </TouchableOpacity>
    </View>
  );
}