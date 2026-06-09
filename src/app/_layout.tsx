import "../../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/auth";

function RootLayoutNav() {
  const { session, couple, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const segmentPath = segments.join("/");
    const isAtLink = segmentPath === "couple/link";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && !couple && !isAtLink) {
      router.replace("/couple/link");
    } else if (session && couple && (inAuthGroup || isAtLink)) {
      router.replace("/(main)");
    }
  }, [session, couple, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen
        name="couple/link"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="couple/settings"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
