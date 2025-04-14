import { Pressable, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab({ testID, ...props }: BottomTabBarButtonProps & { testID?: string }) {
  return (
    <Pressable
      {...props}
      testID={testID}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.inner}>
        {props.children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
});