import React, { useState, useCallback } from "react";
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
  BackHandler,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Phone, Maximize2, ExternalLink, X } from "lucide-react-native";
import ImageZoom from "react-native-image-zoom-viewer";
import WebView from "react-native-webview";
import { Colors } from "../../../constants/Colors";
import { useFocusEffect } from "@react-navigation/native";

export default function BlogDetails() {
  const params = useLocalSearchParams();
  const blog = JSON.parse(params.blog);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState("");
  const [showWebView, setShowWebView] = useState(false);

  const handleExternalLink = (url) => {
    setWebViewUrl(url);
    setShowWebView(true);
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Back button handler for WebView
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showWebView) {
          setShowWebView(false);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [showWebView])
  );

  // Render WebView if active
  if (showWebView) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={() => setShowWebView(false)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <WebView source={{ uri: webViewUrl }} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          animation: "slide_from_right",
          animationDuration: 250,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Blog Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: blog.imageUrl }}
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
          <Modal visible={isImageViewerVisible} transparent={false}>
            <ImageZoom
              imageUrls={[{ url: blog.imageUrl }]}
              index={0}
              enableSwipeDown
              onSwipeDown={() => setIsImageViewerVisible(false)}
              backgroundColor="white"
              maxOverflow={0}
              renderHeader={() => (
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsImageViewerVisible(false)}
                >
                  <X size={30} color="white" />
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
              <Text style={styles.authorName}>{blog.name}</Text>
            </View>

            {/* Content */}
            <Text style={styles.content}>{blog.content}</Text>

            {/* Published Time */}
            <View style={styles.publishedTimeContainer}>
              <Text style={styles.publishedLabel}>Posted on</Text>
              <Text style={styles.publishedTime}>{blog.date}</Text>
            </View>

            {/* External Links Section */}
            {(blog.externalLink1 || blog.externalLink2) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>External Links</Text>

                {blog.externalLink1 && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => handleExternalLink(blog.externalLink1)}
                  >
                    <ExternalLink size={20} color={Colors.PRIMARY} />
                    <Text style={styles.linkButtonText}>
                      {blog.externalLink1}
                    </Text>
                  </TouchableOpacity>
                )}

                {blog.externalLink2 && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => handleExternalLink(blog.externalLink2)}
                  >
                    <ExternalLink size={20} color={Colors.PRIMARY} />
                    <Text style={styles.linkButtonText}>
                      {blog.externalLink2}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Contact Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{blog.userType} Details</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => handleCall(blog.contactNumber)}
              >
                <Phone size={20} color={Colors.PRIMARY} />
                <Text style={styles.linkButtonText}>{blog.contactNumber}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  section: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "outfit-bold",
    color: "#333",
    marginBottom: 15,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  linkButtonText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "outfit-medium",
    color: "#333",
  },
  webViewHeader: {
    height: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontFamily: "outfit-medium",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
  },
});
