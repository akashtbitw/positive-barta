import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Modal,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Facebook,
  Youtube,
  Phone,
  Maximize2,
  ArrowLeft,
} from "lucide-react-native";
import ImageZoom from "react-native-image-zoom-viewer";
import { Colors } from "../../constants/Colors";

export default function BlogDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const blog = JSON.parse(params.blog);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const handleSocialLink = async (url) => {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Blog Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={
              blog.imageUrl
                ? { uri: blog.imageUrl }
                : require("../../assets/images/placeholder.png")
            }
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsImageViewerVisible(true)}
          >
            <Maximize2 size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Image Viewer Modal */}
        <Modal visible={isImageViewerVisible} transparent={true}>
          <ImageZoom
            imageUrls={[{ url: blog.imageUrl }]}
            enableSwipeDown
            onSwipeDown={() => setIsImageViewerVisible(false)}
            backgroundColor="black"
            renderHeader={() => (
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsImageViewerVisible(false)}
              >
                <Text style={{ color: "white", fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            )}
          />
        </Modal>

        {/* Rest of the content remains the same */}
        <View style={styles.contentContainer}>
          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{blog.category}</Text>
              <Text style={styles.tag}>{blog.district}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{blog.title}</Text>

          {/* Author Information */}
          <View style={styles.authorSection}>
            <Text style={styles.authorLabel}>Posted by</Text>
            <Text style={styles.authorName}>
              {blog.individualName || blog.organisationName}
            </Text>
          </View>

          {/* Content */}
          <Text style={styles.content}>{blog.content}</Text>

          {/* Published Time */}
          <View style={styles.publishedTimeContainer}>
            <Text style={styles.publishedLabel}>Posted on</Text>
            <Text style={styles.publishedTime}>{blog.date}</Text>
          </View>

          {/* Contact and Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Connect with Author</Text>

            {/* Phone */}
            {blog.organisationContact && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleCall(blog.organisationContact)}
              >
                <Phone size={20} color={Colors.PRIMARY} />
                <Text style={styles.socialButtonText}>
                  {blog.organisationContact}
                </Text>
              </TouchableOpacity>
            )}

            {/* Facebook */}
            {blog.facebookLink && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(blog.facebookLink)}
              >
                <Facebook size={20} color={Colors.PRIMARY} />
                <Text style={styles.socialButtonText}>Facebook Profile</Text>
              </TouchableOpacity>
            )}

            {/* YouTube */}
            {blog.youtubeLink && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(blog.youtubeLink)}
              >
                <Youtube size={20} color={Colors.PRIMARY} />
                <Text style={styles.socialButtonText}>YouTube Channel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "white",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  expandButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  tagContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: Colors.PRIMARY,
    fontSize: 14,
    fontFamily: "outfit-medium",
  },
  publishedTimeContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  publishedLabel: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontFamily: "outfit-medium",
    marginBottom: 4,
  },
  publishedTime: {
    color: "#666",
    fontSize: 14,
    fontFamily: "outfit-regular",
  },
  title: {
    fontSize: 24,
    fontFamily: "outfit-bold",
    color: "#333",
    marginBottom: 15,
    lineHeight: 32,
  },
  authorSection: {
    marginBottom: 20,
  },
  authorLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "outfit-regular",
  },
  authorName: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
    marginTop: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    fontFamily: "outfit-regular",
    marginBottom: 20,
  },
  socialSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "outfit-bold",
    color: "#333",
    marginBottom: 15,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "outfit-medium",
    color: "#333",
  },
});
