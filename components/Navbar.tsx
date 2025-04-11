import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

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
        paddingVertical: 5,
        backgroundColor: isDarkMode ? '#272727' : '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 5,
        zIndex: 10, 
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Image
            source={require('../public/images/ewalled.png')}
            style={{ width: 160, height: 60 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginLeft: 10,
            color: isDarkMode ? '#fff' : '#000',
          }}
        >
        </Text>
      </View>

      <TouchableOpacity onPress={toggleTheme}>
        <Image
          source={
            isDarkMode
              ? require('../public/images/moon.png')  // Ganti path sesuai ikon
              : require('../public/images/sun.png')
          }
          style={{ width: 24, height: 24, marginTop: 40 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}