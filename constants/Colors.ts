/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  dark: {
    text: "#FFFFFF", // White text for dark mode
    background: "#272727", // Dark background for dark mode
    tint: "#0061FF", // Active tint color (icon/text) for dark mode
    icon: "#0061FF", // Icon color for dark mode
    tabIconDefault: "#888888", // Default icon color for inactive tabs (light gray)
    tabIconSelected: "#0061FF", // Icon color for active tab
    inactiveTint: "#888888", // Inactive tab color (gray) for dark mode
  },
  light: {
    text: "#000000", // Black text for light mode
    background: "#FFFFFF", // Light background for light mode
    tint: "#0061FF", // Active tint color (icon/text) for light mode
    icon: "#0061FF", // Icon color for light mode
    tabIconDefault: "#888888", // Default icon color for inactive tabs (gray)
    tabIconSelected: "#0061FF", // Icon color for active tab
    inactiveTint: "#AAAAAA", // Inactive tab color (gray) for light mode
  },
};