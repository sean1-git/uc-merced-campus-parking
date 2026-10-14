import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#002856",
          tabBarInactiveTintColor: "#8A8D8F",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="lot"
          options={{
            title: "Lots",
            tabBarIcon: ({ color }) => <Ionicons name="location-sharp" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={30} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
