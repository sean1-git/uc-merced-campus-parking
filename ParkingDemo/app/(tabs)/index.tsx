import "@/global.css";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function App() {
  return (
    
      <ImageBackground
        source={require("../../assets/images/campus.png")}
        resizeMode="cover"
        style={{
          width: "100%",
          height: 800,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
      <SafeAreaView
        style={{ flex: 1, alignItems: "center" }}
        edges={["top", "left", "right"]}
      >
         <View
          className="px-4 py-3"
          style={{ transform: [{ translateY: 150 }] }}
        >
          
        <Text className="text-center text-7xl font-bold">
        <Text className="text-[#C9A533]">UC </Text>
        <Text className="text-white">Merced</Text>
        
        </Text>

        <Text className="text-center text-5xl font-bold text-blue-500">
            Campus Parking
          </Text>
        </View>
        </SafeAreaView>
      </ImageBackground>

  );
}