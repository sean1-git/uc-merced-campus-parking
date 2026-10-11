import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";

const PERMITS_URL = "https://taps.ucmerced.edu/permits";

export default function PermitsScreen() {
  const [error, setError] = useState(false);

  async function openPermits() {
    setError(false);
    try {
      await WebBrowser.openBrowserAsync(PERMITS_URL);
    } catch {
      setError(true);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>PARKING PERMITS</Text>
      <Text style={styles.description}>
        Have questions about parking permits? Visit UC Merced Transportation and
        Parking Services (TAPS) for permit information and further help.
      </Text>
      <Pressable
        accessibilityRole="link"
        accessibilityHint="Opens the UC Merced TAPS website"
        onPress={openPermits}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Visit TAPS permit information</Text>
      </Pressable>
      <Text selectable style={styles.url}>
        {PERMITS_URL}
      </Text>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          Could not open the page. Try again, or copy the link above into your
          browser.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 24, gap: 16 },
  title: { color: "#002856", fontSize: 26, fontWeight: "900" },
  description: { color: "#606773", fontSize: 16, lineHeight: 25 },
  button: {
    backgroundColor: "#DAA900",
    borderRadius: 10,
    padding: 16,
    minHeight: 48,
    alignItems: "center",
  },
  buttonText: {
    color: "#002856",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: { opacity: 0.7 },
  url: { color: "#606773", fontSize: 14 },
  error: { color: "#B42318", fontSize: 14, lineHeight: 22 },
});
