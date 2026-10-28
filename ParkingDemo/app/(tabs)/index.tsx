import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const photoHeight = Math.max(260, Math.min(height * 0.58, 540));

  return (
    <ScrollView
      style={styles.background}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
    >
      <View style={[styles.hero, { height: photoHeight }]}>
        <Image
          source={require("../../assets/images/campus.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="bottom"
          accessible={false}
        />
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          accessible={false}
        >
          <Defs>
            <LinearGradient id="campusFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.62" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.76" stopColor="#FFFFFF" stopOpacity="0.2" />
              <Stop offset="0.88" stopColor="#FFFFFF" stopOpacity="0.75" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#campusFade)" />
        </Svg>
      </View>
      <View style={styles.brand}>
        <Text style={styles.title} accessibilityRole="header">
          {"UC Merced\nCampus Parking"}
        </Text>
        <Text style={styles.description}>
          No more worrying about parking availability. Find your spot, right at
          your fingertips.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  hero: {
    width: "100%",
    overflow: "hidden",
  },
  brand: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 480,
    paddingHorizontal: 28,
    marginTop: 16,
  },
  title: {
    color: "#151515",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  description: {
    color: "#737373",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 14,
  },
});
