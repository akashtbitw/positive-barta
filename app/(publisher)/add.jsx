import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { db } from "../../configs/FirebaseConfig";
import { useCategoryList } from "../../hooks/useCategoryList";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  CLOUDINARY_URL,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME,
} from "../../configs/cloudinary";
import { ActivityIndicator } from "react-native";
import { districts } from "../../constants/Districts";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useUser } from "@clerk/clerk-expo";

const { width, height } = Dimensions.get("window");

export default function Explore() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [image, setImage] = useState(null);
  const [facebookLink, setFacebookLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [userType, setUserType] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [organisationContact, setOrganisationContact] = useState("");
  const [individualName, setIndividualName] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);

  // Add validation states
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [userTypeError, setUserTypeError] = useState("");
  const [formDetailsError, setFormDetailsError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [contactError, setContactError] = useState("");

  //Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [imagePublicId, setImagePublicId] = useState("");
  const [compressionProgress, setCompressionProgress] = useState("");
  const [deleteToken, setDeleteToken] = useState("");
  const { categoryList } = useCategoryList();

  const calculateReadingTime = (text) => {
    // Average reading speed (words per minute)
    const wordsPerMinute = 200;
    // Count words (split by spaces and filter out empty strings)
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    // Calculate minutes
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    // Return formatted string
    return `${minutes} mins read`;
  };

  const compressImage = async (uri) => {
    try {
      setCompressionProgress("Optimizing image...");

      // First, resize the image if it's too large
      const manipulateResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          // Resize if larger than 1080px on either dimension
          {
            resize: {
              width: 1080,
              height: 1080,
            },
          },
        ],
        {
          compress: 0.8, // 80% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Get file size in MB
      const response = await fetch(manipulateResult.uri);
      const blob = await response.blob();
      const fileSizeMB = blob.size / (1024 * 1024);

      // If still too large, compress more
      if (fileSizeMB > 1) {
        const additionalCompression = await ImageManipulator.manipulateAsync(
          manipulateResult.uri,
          [],
          {
            compress: 0.6, // Further compress if file is still large
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        setCompressionProgress("");
        return additionalCompression.uri;
      }

      setCompressionProgress("");
      return manipulateResult.uri;
    } catch (error) {
      console.error("Compression error:", error);
      setCompressionProgress("");
      throw new Error("Failed to compress image");
    }
  };

  const uploadToCloudinary = async (uri) => {
    try {
      const formData = new FormData();
      const extension = "jpg"; // We're converting everything to JPEG
      const type = "image/jpeg";

      formData.append("file", {
        uri,
        type,
        name: `upload.${extension}`,
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      setImage(data.secure_url);
      setImagePublicId(data.public_id);
      setDeleteToken(data.delete_token);
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload image");
    }
  };

  const deleteFromCloudinary = async () => {
    if (!imagePublicId || !deleteToken) return;

    try {
      const formData = new FormData();
      formData.append("public_id", imagePublicId);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("token", deleteToken);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.result === "ok") {
        setImage("");
        setImagePublicId("");
        setDeleteToken("");
      }
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error("Failed to delete image");
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });
      if (!result.canceled) {
        setIsUploading(true);

        // Compress image
        const compressedUri = await compressImage(result.assets[0].uri);

        // Upload compressed image
        await uploadToCloudinary(compressedUri);

        setIsUploading(false);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      setIsUploading(false);
      alert("Failed to process image. Please try again.");
    }
  };

  const handleImageChange = async () => {
    try {
      if (image) {
        setIsUploading(true);
        await deleteFromCloudinary();
        setIsUploading(false);
      }
      await pickImage();
    } catch (error) {
      setIsUploading(false);
      alert("Failed to change image. Please try again.");
    }
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

  const handleContactChange = (text) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, "");
    setOrganisationContact(numericText);

    // Clear error if user is typing
    if (numericText.length > 0) {
      setContactError("");
    }

    // Show error if number is complete but invalid
    if (numericText.length === 10 && !validatePhoneNumber(numericText)) {
      setContactError("Please enter a valid 10-digit phone number");
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Reset all error states
    setTitleError("");
    setContentError("");
    setUserTypeError("");
    setFormDetailsError("");
    setCategoryError("");
    setDistrictError("");
    setContactError("");

    // Validate title
    if (!title.trim()) {
      setTitleError("Post title is required");
      isValid = false;
    }

    // Validate content
    if (!content.trim()) {
      setContentError("Post content is required");
      isValid = false;
    }

    // Validate category
    if (!selectedCategory) {
      setCategoryError("Please select a category");
      isValid = false;
    }

    // Validate district
    if (!district) {
      setDistrictError("Please select a district");
      isValid = false;
    }

    // Validate user type
    if (!userType) {
      setUserTypeError(
        "Please select whether you are an Organisation or Individual"
      );
      isValid = false;
    }

    // Validate organisation/individual details
    if (userType === "Organisation") {
      if (!organisationName.trim()) {
        setFormDetailsError("Organisation name is required");
        isValid = false;
      }

      if (!organisationContact.trim()) {
        setContactError("Contact number is required");
        isValid = false;
      } else if (!validatePhoneNumber(organisationContact)) {
        setContactError("Please enter a valid 10-digit phone number");
        isValid = false;
      }
    } else if (userType === "Individual") {
      if (!individualName.trim()) {
        setFormDetailsError("Individual name is required");
        isValid = false;
      }
    }

    return isValid;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const blogData = {
        title,
        content,
        readingTime: calculateReadingTime(content),
        category: selectedCategory,
        district,
        imageUrl: image || "",
        userType,
        userId: user.id,
        facebookLink: facebookLink || "",
        youtubeLink: youtubeLink || "",
        createdAt: Timestamp.now(),
        status: "pending", // Default status
        ...(userType === "Organisation"
          ? {
              organisationName,
              organisationContact,
            }
          : {
              individualName,
            }),
      };

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "blogs"), blogData);
      console.log("Document written with ID: ", docRef.id);

      // Reset form fields
      setTitle("");
      setContent("");
      setImage(null);
      setFacebookLink("");
      setYoutubeLink("");
      setBold(false);
      setItalic(false);
      setUserType("");
      setOrganisationName("");
      setOrganisationContact("");
      setIndividualName("");
      setDistrict("");
      setSelectedCategory("");

      alert("Post Published Successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to publish post. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, titleError && styles.inputError]}
            placeholder="Enter Post Title *"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setTitleError("");
            }}
            placeholderTextColor="#666"
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}
        </View>

        {/* Content Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.contentInput,
              contentError && styles.inputError,
              bold && { fontWeight: "bold" },
              italic && { fontStyle: "italic" },
            ]}
            placeholder="Write your content here... *"
            multiline
            value={content}
            onChangeText={(text) => {
              setContent(text);
              setContentError("");
            }}
            placeholderTextColor="#666"
          />
          {contentError ? (
            <Text style={styles.errorText}>{contentError}</Text>
          ) : null}
        </View>

        {/* Formatting Options */}
        <View style={styles.formattingOptions}>
          <TouchableOpacity
            style={[styles.formatButton, bold && styles.activeButton]}
            onPress={() => setBold(!bold)}
          >
            <Text style={[styles.buttonText, bold && styles.activeButtonText]}>
              B
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatButton, italic && styles.activeButton]}
            onPress={() => setItalic(!italic)}
          >
            <Text
              style={[styles.buttonText, italic && styles.activeButtonText]}
            >
              I
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Selection Button */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.selectionButton, categoryError && styles.inputError]}
            onPress={() => {
              setIsCategoryModalVisible(true);
              setCategoryError("");
            }}
          >
            <Text style={styles.selectionButtonText}>
              {selectedCategory || "Select Category *"}
            </Text>
          </TouchableOpacity>
          {categoryError ? (
            <Text style={styles.errorText}>{categoryError}</Text>
          ) : null}
        </View>

        {/* District Selection Button */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.selectionButton, districtError && styles.inputError]}
            onPress={() => {
              setIsDistrictModalVisible(true);
              setDistrictError("");
            }}
          >
            <Text style={styles.selectionButtonText}>
              {district || "Select District *"}
            </Text>
          </TouchableOpacity>
          {districtError ? (
            <Text style={styles.errorText}>{districtError}</Text>
          ) : null}
        </View>

        {/* Image Picker */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handleImageChange}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#0000ff" />
                <Text style={styles.uploadingText}>
                  {compressionProgress || "Uploading..."}
                </Text>
              </View>
            ) : (
              <Text style={styles.imagePickerText}>
                {image ? "Change Image" : "Add Image"}
              </Text>
            )}
          </TouchableOpacity>
          {image && (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          )}
        </View>

        {/* Social Media Links */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Facebook Link (Optional)"
            value={facebookLink}
            onChangeText={setFacebookLink}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter YouTube Link (Optional)"
            value={youtubeLink}
            onChangeText={setYoutubeLink}
            placeholderTextColor="#666"
          />
        </View>

        {/* User Type Selection */}
        <View style={styles.userTypeSection}>
          <Text style={styles.sectionTitle}>
            Are you an Organisation or Individual? *
          </Text>
          <View style={styles.userTypeButtons}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "Organisation" && styles.selectedUserType,
                userTypeError && styles.buttonError,
              ]}
              onPress={() => {
                setUserType("Organisation");
                setUserTypeError("");
              }}
            >
              <Text
                style={[
                  styles.userTypeText,
                  userType === "Organisation" && styles.selectedUserTypeText,
                ]}
              >
                Organisation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "Individual" && styles.selectedUserType,
                userTypeError && styles.buttonError,
              ]}
              onPress={() => {
                setUserType("Individual");
                setUserTypeError("");
              }}
            >
              <Text
                style={[
                  styles.userTypeText,
                  userType === "Individual" && styles.selectedUserTypeText,
                ]}
              >
                Individual
              </Text>
            </TouchableOpacity>
          </View>
          {userTypeError ? (
            <Text style={styles.errorText}>{userTypeError}</Text>
          ) : null}
        </View>

        {/* Dynamic Form */}
        {userType === "Organisation" && (
          <View style={styles.dynamicForm}>
            <TextInput
              style={[styles.input, formDetailsError && styles.inputError]}
              placeholder="Enter Organisation Name *"
              value={organisationName}
              onChangeText={(text) => {
                setOrganisationName(text);
                setFormDetailsError("");
              }}
              placeholderTextColor="#666"
            />
            <View>
              <TextInput
                style={[styles.input, contactError && styles.inputError]}
                placeholder="Enter Contact Number (10 digits) *"
                value={organisationContact}
                onChangeText={handleContactChange}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#666"
              />
              {contactError ? (
                <Text style={styles.errorText}>{contactError}</Text>
              ) : null}
            </View>
            {formDetailsError ? (
              <Text style={styles.errorText}>{formDetailsError}</Text>
            ) : null}
          </View>
        )}
        {userType === "Individual" && (
          <View style={styles.dynamicForm}>
            <TextInput
              style={[styles.input, formDetailsError && styles.inputError]}
              placeholder="Enter Your Name *"
              value={individualName}
              onChangeText={(text) => {
                setIndividualName(text);
                setFormDetailsError("");
              }}
              placeholderTextColor="#666"
            />
            {formDetailsError ? (
              <Text style={styles.errorText}>{formDetailsError}</Text>
            ) : null}
          </View>
        )}

        {/* Publish Button */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>Publish Post</Text>
        </TouchableOpacity>

        {/* Category Modal */}
        <Modal
          visible={isCategoryModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView>
                {categoryList.map((category) => (
                  <TouchableOpacity
                    key={category?.id}
                    style={[
                      styles.modalOption,
                      selectedCategory === category?.name &&
                        styles.selectedModalOption,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category?.name);
                      setCategoryError("");
                      setIsCategoryModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedCategory === category?.name &&
                          styles.selectedModalOptionText,
                      ]}
                    >
                      {category?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsCategoryModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* District Modal */}
        <Modal
          visible={isDistrictModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select District</Text>
              <ScrollView>
                {districts.map((dist) => (
                  <TouchableOpacity
                    key={dist}
                    style={[
                      styles.modalOption,
                      district === dist && styles.selectedModalOption,
                    ]}
                    onPress={() => {
                      setDistrict(dist);
                      setDistrictError("");
                      setIsDistrictModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        district === dist && styles.selectedModalOptionText,
                      ]}
                    >
                      {dist}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsDistrictModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 20,
  },
  input: {
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#1A1A1A",
  },
  contentInput: {
    height: 180,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#1A1A1A",
    textAlignVertical: "top",
  },
  formattingOptions: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  formatButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF0000",
  },
  activeButton: {
    backgroundColor: "#FF0000",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF0000",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  selectionButton: {
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectionButtonText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  imagePicker: {
    height: 56,
    backgroundColor: "#FF0000",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FF0000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imagePreview: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    marginBottom: 24,
  },
  userTypeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  userTypeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  userTypeButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedUserType: {
    backgroundColor: "#FF0000",
    borderColor: "#FF0000",
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  selectedUserTypeText: {
    color: "#FFFFFF",
  },
  dynamicForm: {
    marginBottom: 24,
    gap: 4,
  },
  publishButton: {
    height: 56,
    backgroundColor: "#28A745",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#28A745",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  publishButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
    width: width,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 56,
  },
  selectedModalOption: {
    backgroundColor: `#FF000015`,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: "outfit-medium",
    color: "#333",
  },
  selectedModalOptionText: {
    color: "#FF0000",
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontFamily: "outfit-bold",
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputError: {
    borderColor: "#ff0000",
    borderWidth: 1,
  },
  buttonError: {
    borderColor: "#ff0000",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 5,
    marginBottom: 0,
  },
  imageSection: {
    marginVertical: 24,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  uploadingText: {
    color: "#666",
    fontSize: 14,
  },
});
