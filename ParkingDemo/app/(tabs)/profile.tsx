import { StyleSheet, View } from "react-native";
import Announcements from "../../components/announcements";

const Settings = () => {
  return (

      <View style={styles.background}>
     <Announcements />
    </View>
  );
}

const styles = StyleSheet.create({
   background: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default Settings;
