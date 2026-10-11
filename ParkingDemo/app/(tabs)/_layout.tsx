import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";


function CampusHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.headerRow}>
        {/* Balances the profile button to center the title */}
        <View style={styles.side} />

        <View style={styles.brand}>
          <Text style={styles.title}>
            <Text style ={{color: "#DAA900"}}>UC</Text>
            {" MERCED"}
          </Text>
          <Text style={styles.subtitle}>Campus Parking</Text>
        </View>

        <Pressable
          style={styles.side}
          onPress={() => router.navigate("/(tabs)/profile")}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Ionicons
            name="person-circle-outline"
            size={36}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <CampusHeader />,
        tabBarActiveTintColor: "#002856",
        tabBarInactiveTintColor: "#8A8D8F",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="lot"
        options={{
          title: "Lots",
          tabBarIcon: ({ color }) => (
            <Ionicons name="location-sharp" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="permits"
        options={{
          title: "Permits",
          tabBarIcon: ({ color }) => (
            <Ionicons name="card-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={30} color={color} />
          ),
        }}
      />

      {/* Hide your other routes from the navigation bar */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="subscriptions/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#002856",
    borderBottomWidth: 4,
    borderBottomColor: "#DAA900",
  },
  headerRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  side: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },
});