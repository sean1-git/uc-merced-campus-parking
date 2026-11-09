import { Text, View, ScrollView, StyleSheet } from "react-native";
import BellevueLot from "../../components/bellevue";
import ScholarLot from "../../components/scholar";
import NorthBowlLot from "../../components/northbowl";

const NAVY = "#002856";

export default function LotsScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>PARKING LOTS</Text>

      <View style={styles.lots}>
        <BellevueLot />
        <ScholarLot />
        <NorthBowlLot />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lots: {
    gap: 14,
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heading: {
    color: NAVY,
    fontSize: 26,
    fontWeight: "800",
    marginLeft: 4,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#0a0a0a",
  },
});
