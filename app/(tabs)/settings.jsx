import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function Profile() {
  const { signOut } = useAuth();

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
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Details Section */}
      <Text style={styles.header}>Positive Barta</Text>
      <View style={styles.appDetails}>
        <Text style={styles.appDetailsText}>
          Positive Barta is a blogging platform that allows users to share their
          thoughts, ideas, and experiences with the world. Explore diverse
          categories and connect with like-minded individuals!
        </Text>
      </View>

      {/* Profile Settings Button */}
      <TouchableOpacity
        style={styles.settingButton}
        onPress={() => alert("Navigating to Profile Settings")}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  appDetails: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  appDetailsText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  settingButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#007BFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  signOutButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#FF4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
