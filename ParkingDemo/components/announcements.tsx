import { StyleSheet, Text, View } from "react-native";



export default function Announcements() {


  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headingGroup}>
          <Text style={styles.heading} accessibilityRole="header">
            Announcements
          </Text>
          <Text style={styles.subtitle}>Campus parking updates</Text>
        </View>


          <Text style={styles.viewAll}>View all</Text>

      </View>



    </View>
  );
}

const styles = StyleSheet.create({
   background: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  section: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 20,
    marginTop: 28,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  headingGroup: {
    flex: 1,
  },
  heading: {
    fontSize: 23,
    fontWeight: "800",
    color: "#151515",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    marginTop: 4,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "700",
    color: "#002856",
  },


});
