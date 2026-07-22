import { Tabs, Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MainLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          headerRight: () => (
            <Link href="/couple/settings" asChild>
              <TouchableOpacity style={{ marginRight: 16 }}>
                <Ionicons name="settings-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Pendientes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="clipboard-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
