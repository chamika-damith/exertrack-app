import { PostureTemplateProvider } from "@/contexts/PostureTemplateContext";
import { UserProvider } from "@/contexts/UserContext";
import { WorkoutHistoryProvider } from "@/contexts/WorkoutHistoryContext";
import { initPoseDetection } from "@/utils/poseDetection";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="register" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="profile" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="progress" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="exercises" options={{ headerShown: false }} />
      <Stack.Screen name="exercise/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="camera/[id]" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="summary/[id]" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🚀 App initialization started");
        console.log("📱 Platform:", Platform.OS);

        // Only initialize TensorFlow on native platforms
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          console.log("✅ Native platform detected, initializing TensorFlow...");
          const success = await initPoseDetection();

          if (!success) {
            setInitError("Failed to initialize pose detection. Some features may not work.");
            console.error("❌ TensorFlow initialization failed");
          }
        } else {
          console.warn("⚠️ Web platform detected - TensorFlow pose detection is not supported on web");
          console.warn("⚠️ Please run this app on iOS or Android for full functionality");
          setInitError("This app requires iOS or Android. Web platform is not supported.");
        }

        await SplashScreen.hideAsync();
        setIsInitializing(false);
        console.log("✅ App initialization complete");
      } catch (error) {
        console.error("❌ App initialization error:", error);
        setInitError("Initialization failed. Please restart the app.");
        setIsInitializing(false);
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A8E8" />
        <Text style={styles.loadingText}>Initializing ExerTrack...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <WorkoutHistoryProvider>
          <PostureTemplateProvider>
            <GestureHandlerRootView>
              {initError && Platform.OS === 'web' && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {initError}</Text>
                </View>
              )}
              <RootLayoutNav />
            </GestureHandlerRootView>
          </PostureTemplateProvider>
        </WorkoutHistoryProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  errorBanner: {
    backgroundColor: '#FFC107',
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
});
