import "../../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { AuthProvider, useAuth } from "../context/auth";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ToastProvider } from "../components/ui/Toast";

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
      router.replace("/(auth)/welcome");
    } else if (session && !couple && !isAtLink) {
      router.replace("/couple/link");
    } else if (session && couple && (inAuthGroup || isAtLink)) {
      router.replace("/(main)");
    }
  }, [session, couple, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-dark">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#0D0D1A" } }}>
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
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-dark">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
