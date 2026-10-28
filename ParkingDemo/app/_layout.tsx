import { Slot } from "expo-router";

export default function RootLayout() {
  // Each screen and the tab bar handle their own safe-area spacing.
  // Expo Router's fallback root adds another SafeAreaView on iOS.
  return <Slot />;
}
