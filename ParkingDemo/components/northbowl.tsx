import { Text, View, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#002856";

export default function NorthBowlLot() {
  return (
    <Pressable
      disabled
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      accessibilityLabel="North Bowl Lot"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        source={require("../assets/images/northbowl.png")}
        style={styles.photo}
        contentFit="cover"
        contentPosition="left center"
        accessible={false}
      />
      <View style={styles.details}>
        <Text style={styles.lotName}>NORTH BOWL LOT</Text>

        <View style={styles.schedule}>
          <Text style={styles.hours}>
            <Text style={styles.zone}>Green Zone: </Text>
            Monday–Friday,{"\n"}7 AM – 6 PM.
          </Text>

          <Text style={styles.hours}>
            <Text style={styles.zone}>Gold Zone: </Text>
            Monday–Friday,{"\n"}7 AM – 8 PM.
          </Text>

          <Text style={styles.hours}>
            <Text style={styles.zone}>H Zone: </Text>
            24/7.
          </Text>
        </View>
      </View>

      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={NAVY}
          accessible={false}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B8D2EA",
    borderRadius: 20,
    padding: 12,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.8,
  },

  photo: {
    width: "37%",
    height: 154,
    borderRadius: 15,
    backgroundColor: "#D6E3EF",
  },

  details: {
    flex: 1,
    paddingRight: 12,
  },

  lotName: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  schedule: {
    gap: 10,
  },

  hours: {
    color: "#102536",
    fontSize: 13,
    lineHeight: 18,
  },

  zone: {
    fontWeight: "700",
  },

  arrow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 2,
    justifyContent: "center",
  },
});
