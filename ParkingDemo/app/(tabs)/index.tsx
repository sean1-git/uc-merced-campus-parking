import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

export default function HomeScreen() {
  return (
    <View style={styles.background}>
      <Image
        source={require("../../assets/images/campus.png")}
        style={styles.photo}
        contentFit="cover"
        contentPosition="center"
        accessible={false}
      />
      <View style={styles.brand}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          <Text style={styles.gold}>UC</Text> Merced
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
          Campus Parking
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  photo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  brand: {
    position: "absolute",
    top: "23%",
    left: "7%",
    right: "7%",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 60,
    fontWeight: "800",
    textAlign: "center",
  },
  gold: {
    color: "#C2A546",
  },
  subtitle: {
    color: "#477CF5",
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
});
