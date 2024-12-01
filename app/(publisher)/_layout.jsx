import React, { useEffect, useRef, useState } from "react";
import { Tabs, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../../constants/Colors";
import { Animated, Platform, Dimensions } from "react-native";
export default function TabLayout() {
  const pathname = usePathname();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Get tab bar height based on platform
  const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 60;

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    const shouldHideTabBar = pathname.includes("/blog-details");

    Animated.timing(slideAnim, {
      toValue: shouldHideTabBar ? TAB_BAR_HEIGHT : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [pathname, isInitialRender]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarStyle: {
          transform: [
            {
              translateY: slideAnim,
            },
          ],
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        tabBarBackground: () => (
          <Animated.View
            style={{
              backgroundColor: "white",
              height: "100%",
            }}
          />
        ),
        // Add padding to the bottom of screens to prevent content overlap
        contentStyle: {
          paddingBottom: TAB_BAR_HEIGHT,
        },
      }}
    >
      <Tabs.Screen
        name="list"
        options={{
          tabBarLabel: "My Blogs",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: "Add",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
