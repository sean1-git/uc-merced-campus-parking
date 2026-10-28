import { Tabs, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ParkingTabBar } from "../../components/parking-tab-bar";

export default function TabLayout() {
  const isHome = usePathname() === "/";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={isHome ? ["left", "right"] : ["top", "left", "right"]}
    >
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <ParkingTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="lot" options={{ title: "Lots" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </SafeAreaView>
  );
}
