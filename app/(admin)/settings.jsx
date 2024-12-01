import React, { useState, useEffect } from "react";
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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from ".././../configs/FirebaseConfig";
import { Eye, EyeOff, ChevronDown } from "lucide-react-native";

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const role = user?.unsafeMetadata?.role;

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

  const [isCategoriesModalVisible, setIsCategoriesModalVisible] =
    useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  useEffect(() => {
    fetchCategories();
  }, []);

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
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRef = query(
        collection(db, "categories"),
        orderBy("name")
      );
      const snapshot = await getDocs(categoriesRef);
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to fetch categories");
    }
  };

  const capitalizeFirstLetter = (name) => {
    return (
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase()
    );
  };

  const handleAddCategory = async () => {
    // Validate inputs
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    if (!newCategoryIcon.trim()) {
      Alert.alert("Error", "Category icon URL is mandatory");
      return;
    }

    // Validate icon URL
    if (!isValidUrl(newCategoryIcon)) {
      Alert.alert("Error", "Please enter a valid icon URL");
      return;
    }

    try {
      // Attempt to verify the image URL
      const response = await fetch(newCategoryIcon);
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.startsWith("image/")) {
        Alert.alert("Error", "The provided URL must be a valid image");
        return;
      }

      const categoriesRef = collection(db, "categories");
      await addDoc(categoriesRef, {
        name: capitalizeFirstLetter(newCategoryName),
        icon: newCategoryIcon.trim(),
      });

      // Reset input fields
      setNewCategoryName("");
      setNewCategoryIcon("");

      // Refresh categories list
      await fetchCategories();

      Alert.alert("Success", "Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert(
        "Error",
        "Failed to add category. Please check the icon URL."
      );
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this category?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const categoryRef = doc(db, "categories", categoryId);
              await deleteDoc(categoryRef);

              // Refresh categories list
              await fetchCategories();

              Alert.alert("Success", "Category deleted successfully");
            } catch (error) {
              console.error("Error deleting category:", error);
              Alert.alert("Error", "Failed to delete category");
            }
          },
        },
      ]
    );
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
  const handleCategoriesScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    setIsScrolledToBottom(isBottom);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      {/* App Details Section */}
      <Text style={styles.header}>
        {role === "Admin" ? `Welcome ${role}` : `Welcome ${role} Admin`}
      </Text>
      <View style={styles.appDetails}>
        <Text style={styles.appDetailsText}>
          Positive Barta is a blogging platform that allows users to share their
          thoughts, ideas, and experiences with the world. Explore diverse
          categories and connect with like-minded individuals!
        </Text>
      </View>

      {/* Categories Management Button */}
      {user?.unsafeMetadata?.role === "Admin" && (
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => setIsCategoriesModalVisible(true)}
        >
          <Text style={styles.buttonText}>Manage Categories</Text>
        </TouchableOpacity>
      )}

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
      {/* Categories Management Modal */}
      <Modal
        visible={isCategoriesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCategoriesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Manage Categories</Text>

            {/* Existing Categories List */}
            <ScrollView
              style={styles.categoriesList}
              onScroll={handleCategoriesScroll}
            >
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <Image
                    source={{ uri: category.icon }}
                    style={styles.categoryIcon}
                    onError={(e) => {
                      console.log("Image load error", e.nativeEvent.error);
                      Alert.alert("Error", "Failed to load category icon");
                    }}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteCategoryButton}
                    onPress={() => handleDeleteCategory(category.id)}
                  >
                    <Text style={styles.deleteCategoryButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Scroll Down Indicator */}
            {!isScrolledToBottom && categories.length > 5 && (
              <View style={styles.scrollIndicator}>
                <ChevronDown size={20} color="#666" />
              </View>
            )}

            {/* Add New Category Section */}
            <Text style={styles.sectionTitle}>Add New Category</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Category Name (Required)"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Category Icon URL (Required)"
                value={newCategoryIcon}
                onChangeText={setNewCategoryIcon}
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.modalButtonText}>Add Category</Text>
            </TouchableOpacity>

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsCategoriesModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
  },
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
    marginTop: 5,
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
  categoriesList: {
    maxHeight: 250,
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
  deleteCategoryButton: {
    backgroundColor: "#FF4444",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCategoryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Scroll Indicator
  scrollIndicator: {
    alignItems: "center",
    padding: 10,
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
