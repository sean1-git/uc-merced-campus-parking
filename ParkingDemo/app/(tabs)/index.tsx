import { Text, View, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Link } from "expo-router";
import Svg, { Circle } from "react-native-svg";

const NAVY = "#002856";
const GOLD = "#DAA900";

const quickTools = [
  {
    label: "Parking Portal",
    icon: "card-outline",
    url: "https://ucmerced.t2hosted.com/Account/Portal",
  },
  {
    label: "Parking Map",
    icon: "map-outline",
    url: "https://taps.ucmerced.edu/campusparkingmap",
  },
] as const;

async function openTool(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    Alert.alert("Could not open page", "Please try again.");
  }
}

type ParkingCounts = {
  available: number;
  total: number;
};

function BellevueAvailability({
  counts = null,
}: {
  counts?: ParkingCounts | null;
}) {
  let percentage: number | null = null;

  if (
    counts !== null &&
    Number.isFinite(counts.available) &&
    Number.isFinite(counts.total) &&
    counts.total > 0 &&
    counts.available >= 0 &&
    counts.available <= counts.total
  ) {
    percentage = Math.round((counts.available / counts.total) * 100);
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.availabilityCard}>
      <Text style={styles.cardTitle}>Campus lots</Text>
      <Text style={styles.cardSubtitle}>% spaces available</Text>

      <View style={styles.chartSection}>
        <View
          style={styles.chart}
          accessible
          accessibilityLabel={
            percentage === null
              ? "Bellevue Lot availability is not available yet"
              : `Bellevue Lot: ${percentage}% of spaces available`
          }
        >
          <Svg width={132} height={132} accessible={false}>
            <Circle
              cx={66}
              cy={66}
              r={radius}
              fill="none"
              stroke="#E8ECF0"
              strokeWidth={12}
            />

            {percentage !== null && percentage > 0 && (
              <Circle
                cx={66}
                cy={66}
                r={radius}
                fill="none"
                stroke={GOLD}
                strokeWidth={12}
                strokeDasharray={[circumference, circumference]}
                strokeDashoffset={circumference * (1 - percentage / 100)}
                transform="rotate(-90 66 66)"
              />
            )}
          </Svg>

          <View style={styles.chartCenter}>
            <Text style={styles.percentage}>
              {percentage === null ? "—" : `${percentage}%`}
            </Text>
          </View>
        </View>

        <Text style={styles.lotName}>Bellevue Lot</Text>

        {percentage === null && (
          <Text style={styles.pending}>Availability coming soon</Text>
        )}
      </View>

     <Link href="/(tabs)/lot" asChild>
        <Pressable
            accessibilityRole="link"
            style={styles.findButton}
        >
            <Text style={styles.findButtonText}>Find parking</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>PARKING OVERVIEW</Text>

      <BellevueAvailability />

      <View style={styles.quickTools}>
        <Text style={styles.sectionTitle}>QUICK TOOLS</Text>

        <View style={styles.toolsRow}>
          {quickTools.map((tool) => (
            <Pressable
              key={tool.label}
              accessibilityRole="link"
              accessibilityLabel={tool.label}
              accessibilityHint="Opens the website in your browser"
              onPress={() => openTool(tool.url)}
              style={({ pressed }) => [
                styles.tool,
                pressed && styles.toolPressed,
              ]}
            >
              <View style={styles.iconContainer}>
                <View style={styles.goldAccent} />

                <Ionicons
                  name={tool.icon}
                  size={58}
                  color={NAVY}
                  accessible={false}
                />
              </View>

              <Text style={styles.toolLabel}>{tool.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
  },
  pageTitle: {
    color: NAVY,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
  },

  // Parking availability card
  availabilityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE5EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },
  cardTitle: {
    color: NAVY,
    fontSize: 22,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "#606773",
    fontSize: 14,
    marginTop: 3,
  },
  chartSection: {
    alignItems: "center",
    paddingVertical: 18,
  },
  chart: {
    width: 132,
    height: 132,
    position: "relative",
  },
  chartCenter: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    color: NAVY,
    fontSize: 34,
    fontWeight: "800",
  },
  lotName: {
    color: NAVY,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 8,
  },
  pending: {
    color: "#606773",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },
  findButton: {
    backgroundColor: "#002856",
    width: "100%",
    minHeight: 48,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  findButtonText: {
    color: "#fffdfd",
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },

  // Quick Tools
  quickTools: {
    gap: 18,
  },
  sectionTitle: {
    color: NAVY,
    fontSize: 22,
    fontWeight: "800",
  },
  toolsRow: {
    flexDirection: "row",
    gap: 20,
  },
  tool: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
    borderRadius: 14,
  },
  toolPressed: {
    backgroundColor: "#F0F4F8",
    opacity: 0.8,
  },
  iconContainer: {
    width: 76,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  goldAccent: {
    position: "absolute",
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: GOLD,
  },
  toolLabel: {
    color: "#606773",
    fontSize: 16,
    textAlign: "center",
  },
});
