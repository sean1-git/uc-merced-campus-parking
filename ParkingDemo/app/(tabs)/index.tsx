import "@/global.css"
import { Text, View } from "react-native";
import { Link } from "expo-router";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        UC Merced Campus Parking
      </Text>
      <Link href ="/onboarding" 
      className="mt-4 rounded bg-primary text-black p-4">Go to Onboarding</Link>
      <Link href ="/(auth)/sign-in" 
      className="mt-4 rounded bg-primary text-black p-4">Go to Sign in</Link>
      <Link href ="/(auth)/sign-up" 
      className="mt-4 rounded bg-primary text-black p-4">Go to Sign up</Link>


      <Link href ="/subscriptions/spotify">Spotify Subscription</Link>
      <Link
       href ={{
        pathname: "/subscriptions/[id]",
        params: { id: "claude"},
        }} 
       >
      Claude Max Subscription
      </Link>
    </View>
  );
}