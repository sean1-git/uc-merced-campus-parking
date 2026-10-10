import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
//parthenses is auto return, rather than explicitly returning
const TabLayout = () => (
    <Tabs screenOptions={{ headerShown: false,
      tabBarStyle: {
      backgroundColor: "darkblue",
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarActiveTintColor: "gold",
    tabBarInactiveTintColor: "#64748B",
    }}>
        <Tabs.Screen name="index" options ={{ title:'Home', tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" color={color} size={size} />
        ),}}/>
        <Tabs.Screen name="map" options ={{ title:'Map', tabBarIcon: ({color, size})=> (
            <Ionicons name ="location" color = {color} size = {size} />
        ),}}/>
        <Tabs.Screen name="settings" options ={{ title:'Settings', tabBarIcon:({color, size}) =>(
            <Ionicons name  ="settings" color ={color} size= {size}/>
        )}}/>
        <Tabs.Screen name="subscriptions/[id]" options ={{ title:'href: null'}}/>

       
    </Tabs>
)

export default TabLayout