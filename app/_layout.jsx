import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function LayoutContent() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    // Only hide splash screen when authentication is fully loaded
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    outfit: require("./../assets/fonts/Poppins-Medium.ttf"),
    "outfit-medium": require("./../assets/fonts/Poppins-SemiBold.ttf"),
    "outfit-bold": require("./../assets/fonts/Poppins-Bold.ttf"),
  });

  // If fonts are not loaded, keep splash screen
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ClerkLoaded>
        <LayoutContent />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
