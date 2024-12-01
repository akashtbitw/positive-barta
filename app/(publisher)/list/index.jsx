import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../configs/FirebaseConfig";
import Header from "../../../components/Home/Header";
import Category from "../../../components/Home/Category";
import Location from "../../../components/Home/Location";
import BlogCard from "../../../components/Home/BlogCard";
import { ScrollView } from "react-native";
import { ArrowUp, Trash2 } from "lucide-react-native";
import { Colors } from "../../../constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";

export default function Home() {
  const { user } = useUser();
  const scrollViewRef = useRef(null);
  const isInitialMount = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBlogs = async (forceFetch = false) => {
    if (!user) return;
    if (blogs.length > 0 && !forceFetch) {
      setLoading(false);
      return;
    }

    try {
      // Start with base query conditions
      const conditions = [
        // where("status", "==", "pending"),
        where("userId", "==", user.id),
      ];

      // Add category filter if selected
      if (selectedCategory) {
        conditions.push(where("category", "==", selectedCategory));
      }

      // Add district filter if selected
      if (selectedDistrict) {
        conditions.push(where("district", "==", selectedDistrict));
      }

      // Add search query filter if present
      if (searchQuery) {
        conditions.push(
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff")
        );
      }

      // Create the query with all conditions
      const blogsQuery = query(
        collection(db, "blogs"),
        ...conditions,
        orderBy("createdAt", "desc"),
        orderBy("title")
      );

      const querySnapshot = await getDocs(blogsQuery);
      const blogsData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
        date: formatDate(doc.data().createdAt),
      }));

      setBlogs(blogsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Use useFocusEffect instead of useEffect
  useFocusEffect(
    useCallback(() => {
      if (isInitialMount.current) {
        // Only fetch on initial mount
        fetchBlogs(true);
        isInitialMount.current = false;
      }
    }, [user])
  );
  useFocusEffect(
    useCallback(() => {
      if (!isInitialMount.current) {
        // Only fetch when filters change and it's not the initial mount
        fetchBlogs(true);
      }
    }, [user, selectedCategory, selectedDistrict, searchQuery])
  );

  const handleDeleteBlog = async (docId) => {
    Alert.alert(
      "Delete Blog",
      "Are you sure you want to delete this blog?",
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
              await deleteDoc(doc(db, "blogs", docId));
              setBlogs(blogs.filter((blog) => blog.docId !== docId));
              // Show success message
              Alert.alert("Success", "Blog deleted successfully", [
                { text: "OK" },
              ]);
            } catch (error) {
              console.error("Error deleting blog:", error);
              Alert.alert("Error", "Failed to delete the blog");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBlogs(true);
  }, [user, selectedCategory, selectedDistrict, searchQuery]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();

    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return `${time} • ${dateStr}`;
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;

    if (scrollPosition > 200 && !showScrollButton) {
      setShowScrollButton(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (scrollPosition <= 200 && showScrollButton) {
      setShowScrollButton(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
  };

  const handleDistrictReset = () => {
    setSelectedDistrict("");
  };

  const renderBlogCard = (blog) => (
    <View key={blog.docId} style={styles.blogCardContainer}>
      <BlogCard blog={blog} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBlog(blog.docId)}
      >
        <Trash2 size={24} color="red" />
      </TouchableOpacity>
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor:
              blog.status === "pending"
                ? "rgba(255, 193, 7, 0.8)" // Yellow for pending
                : blog.status === "accepted"
                ? "rgba(40, 167, 69, 0.8)" // Green for accepted
                : "rgba(220, 53, 69, 0.8)", // Red for rejected
          },
        ]}
      >
        <Text style={styles.statusText}>
          {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBlogs}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
      >
        <View>
          <Header onSearch={setSearchQuery} />
          <Category
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
          <Location
            selectedDistrict={selectedDistrict}
            onDistrictSelect={handleDistrictSelect}
            onReset={handleDistrictReset}
          />
          {blogs.length > 0 ? (
            blogs.map(renderBlogCard)
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No blogs found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.scrollToTopButton,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={scrollToTop} style={styles.buttonContent}>
          <ArrowUp size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollViewContent: {
    paddingBottom: 100, // Adjust this value based on your tab bar height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "outfit-medium",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "outfit-medium",
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 75,
    right: 20,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: "#666",
  },
  blogCardContainer: {
    position: "relative",
    marginBottom: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 5,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 16, // Increased to move up from bottom edge
    right: 40, // Increased to move in from right edge
    borderRadius: 15,
    padding: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // Added elevation for Android
    shadowColor: "#000", // Added shadow for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontFamily: "outfit-medium",
    textTransform: "capitalize",
  },
});
