import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Profile() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const { signOut } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handlePress = () => {
    alert("Navigating to Profile Settings");
    // Add navigation logic here
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Handle successful sign out (navigation, etc.)
    } catch (error) {
      Alert.alert(
        "Error",
        "There was a problem signing out. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      router.replace("/");
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#000" : "#fff" },
      ]}
    >
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#333" }]}>
        Profile Settings
      </Text>

      {/* Profile Settings Button */}
      <TouchableOpacity
        style={[
          styles.settingButton,
          { backgroundColor: darkMode ? "#333" : "#f9f9f9" },
        ]}
        onPress={handlePress}
      >
        <Text
          style={[styles.buttonText, { color: darkMode ? "#fff" : "#333" }]}
        >
          Edit Profile
        </Text>
      </TouchableOpacity>

      {/* Dark Mode Toggle */}
      <View style={styles.darkModeContainer}>
        <Text
          style={[styles.darkModeText, { color: darkMode ? "#fff" : "#333" }]}
        >
          Dark Mode
        </Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? "#fff" : "#333"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[
          styles.signOutButton,
          { backgroundColor: darkMode ? "#ff4444" : "#ff6b6b" },
        ]}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
  },
  darkModeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkModeText: {
    fontSize: 16,
  },
  signOutButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
