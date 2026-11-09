import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";


const lots = [
  { id: "bellevue", title: "Bellevue Lot", url: "https://park-vis.edgecompute.space/api/parking-layout/embed/YOUR_VIEW_KEY" }

];

export default function AvailabilityScreen() {
  const { lot: lotId } = useLocalSearchParams<{ lot?: string }>();
  const lot = lots.find((item) => item.id === lotId);
  const [failed, setFailed] = useState(false);

return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 20,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/lot");
          }}
        >
          <Text style={{ color: "#002856", fontSize: 16 }}>← Back</Text>
        </Pressable>

        <Text style={{ fontSize: 20, fontWeight: "700", flex: 1 }}>
          {lot?.title ?? "Parking availability"}
        </Text>
      </View>

      {!lot?.url ? (
        <Text style={{ padding: 24 }}>
          Live parking availability is not connected for this lot yet.
        </Text>
      ) : failed ? (
        <Text style={{ padding: 24 }}>
          Unable to load parking availability. Please go back and try again.
        </Text>
      ) : (
        <WebView
          source={{ uri: lot.url }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator
              size="large"
              color="#002856"
              style={{ position: "absolute", alignSelf: "center", top: 80 }}
            />
          )}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
        />
      )}
    </SafeAreaView>
  );
}
