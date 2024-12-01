import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Eye, EyeOff } from "lucide-react-native";

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    digit: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
  });
  // Enhanced password validation
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      digit: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handlePasswordChange = (text) => {
    setNewPassword(text);
    validatePassword(text);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Error",
        "There was a problem signing out. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    // Validate name inputs
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First name and last name cannot be empty");
      return;
    }

    // Password change validation (optional)
    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        Alert.alert("Error", "New passwords do not match");
        return;
      }

      if (!validatePassword(newPassword)) {
        const unmetRequirements = [];
        if (!passwordValidation.length)
          unmetRequirements.push("at least 8 characters");
        if (!passwordValidation.digit) unmetRequirements.push("a digit");
        if (!passwordValidation.uppercase)
          unmetRequirements.push("an uppercase letter");
        if (!passwordValidation.lowercase)
          unmetRequirements.push("a lowercase letter");
        if (!passwordValidation.specialChar)
          unmetRequirements.push("a special character");

        Alert.alert(
          "Invalid Password",
          `Password must contain:\n• ${unmetRequirements.join("\n• ")}`
        );
        return;
      }
    }

    try {
      // Update name
      await user.update({
        firstName,
        lastName,
      });

      // Update password if new password is provided
      if (newPassword) {
        await user.updatePassword({
          currentPassword,
          newPassword,
        });

        // Force sign out after password change
        await signOut();

        Alert.alert(
          "Success",
          "Profile and password updated. Please log in again.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      } else {
        Alert.alert("Success", "Profile updated successfully");
        setIsEditModalVisible(false);
      }

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error(error);

      // Handle specific Clerk error codes
      if (error.status === 422) {
        Alert.alert("Error", "Current password is incorrect");
      } else if (error.status === 403) {
        Alert.alert("Error", "Profile update is not allowed");
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      {/* App Details Section */}
      <Text style={styles.header}>Welcome</Text>
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
        onPress={() => setIsEditModalVisible(true)}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <Text style={styles.sectionTitle}>Change Password (Optional)</Text>

            {/* Current Password Field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff color="#999" size={20} />
                ) : (
                  <Eye color="#999" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* New Password Field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff color="#999" size={20} />
                ) : (
                  <Eye color="#999" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Password Validation Messages */}
            <View style={styles.passwordValidationContainer}>
              <Text
                style={[
                  styles.validationText,
                  { color: passwordValidation.length ? "green" : "red" },
                ]}
              >
                {passwordValidation.length ? "✓" : "✗"} At least 8 characters
              </Text>
              <Text
                style={[
                  styles.validationText,
                  { color: passwordValidation.digit ? "green" : "red" },
                ]}
              >
                {passwordValidation.digit ? "✓" : "✗"} Contains a digit
              </Text>
              <Text
                style={[
                  styles.validationText,
                  { color: passwordValidation.uppercase ? "green" : "red" },
                ]}
              >
                {passwordValidation.uppercase ? "✓" : "✗"} Contains an uppercase
                letter
              </Text>
              <Text
                style={[
                  styles.validationText,
                  { color: passwordValidation.lowercase ? "green" : "red" },
                ]}
              >
                {passwordValidation.lowercase ? "✓" : "✗"} Contains a lowercase
                letter
              </Text>
              <Text
                style={[
                  styles.validationText,
                  { color: passwordValidation.specialChar ? "green" : "red" },
                ]}
              >
                {passwordValidation.specialChar ? "✓" : "✗"} Contains a special
                character
              </Text>
            </View>

            {/* Confirm New Password Field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirmPassword}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#999" size={20} />
                ) : (
                  <Eye color="#999" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  // Main Container Styles
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    paddingBottom: 100,
  },

  // Header Styles
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },

  // App Details Styles
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

  // Button Styles
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

  // Modal Overlay and Positioning
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: width * 0.9, // 90% of screen width
    maxWidth: 500, // Maximum width
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Modal Title
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },

  // Section Title
  sectionTitle: {
    width: "100%",
    textAlign: "left",
    marginVertical: 10,
    fontWeight: "bold",
    color: "#666",
  },

  // Input Wrapper and Input Styles
  input: {
    width: "100%", // Ensure full width of wrapper
    height: 50, // Fixed height
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F9F9F9",
    fontSize: 16,
  },

  // Modal Button Container
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },

  // Modal Buttons
  modalCancelButton: {
    backgroundColor: "#FF4444",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  modalSaveButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Password Input Styles
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordToggle: {
    position: "absolute",
    right: 15,
  },

  // Password Validation Styles
  passwordValidationContainer: {
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  validationText: {
    fontSize: 12,
    marginBottom: 5,
  },
});
