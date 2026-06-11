import "../../global.css";
import { useEffect, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../context/auth";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ToastProvider } from "../components/ui/Toast";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, couple, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    SplashScreen.hideAsync();

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="auto" />
            <RootLayoutNav />
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
