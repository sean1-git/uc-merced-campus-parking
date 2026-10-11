import "@/global.css";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", padding: 24 }}>
      <Text style={{ color: "#002856", fontSize: 26, fontWeight: "800" }}>
        PARKING OVERVIEW
      </Text>
    </View>
  );
}