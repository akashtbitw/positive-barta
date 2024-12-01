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
import React, { useRef, useState, useCallback } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../configs/FirebaseConfig";
import Header from "../../../components/Home/Header";
import Category from "../../../components/Home/Category";
import Location from "../../../components/Home/Location";
import BlogCard from "../../../components/Home/BlogCard";
import { ScrollView } from "react-native";
import { ArrowUp } from "lucide-react-native";
import { Colors } from "../../../constants/Colors";
import { useFocusEffect, Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function Home() {
  const scrollViewRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const isInitialMount = useRef(true);
  const { user } = useUser();
  const fetchPendingCount = async () => {
    try {
      const conditions = [where("status", "==", "pending")];
      if (user?.unsafeMetadata?.role !== "Admin") {
        conditions.push(where("category", "==", user?.unsafeMetadata?.role));
      }

      const countQuery = query(collection(db, "blogs"), ...conditions);
      const snapshot = await getDocs(countQuery);
      setPendingCount(snapshot.size);
    } catch (err) {
      console.error("Error fetching pending count:", err);
    }
  };
  const fetchBlogs = async (forceFetch = false) => {
    // If we have data and it's not a forced fetch, don't fetch again
    if (blogs.length > 0 && !forceFetch) {
      setLoading(false);
      return;
    }

    try {
      const conditions = [where("status", "==", "pending")];
      if (user?.unsafeMetadata?.role !== "Admin") {
        conditions.push(where("category", "==", user?.unsafeMetadata?.role));
      }
      if (selectedCategory) {
        conditions.push(where("category", "==", selectedCategory));
      }

      if (selectedDistrict) {
        conditions.push(where("district", "==", selectedDistrict));
      }

      if (searchQuery) {
        conditions.push(
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff")
        );
      }

      const blogsQuery = query(
        collection(db, "blogs"),
        ...conditions,
        orderBy("createdAt", "desc"),
        orderBy("title")
      );

      const querySnapshot = await getDocs(blogsQuery);
      const blogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
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
  const handleStatusChange = async (blogId, newStatus) => {
    const action = newStatus === "accepted" ? "accept" : "reject";

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${action} this blog?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const blogRef = doc(db, "blogs", blogId);
              await updateDoc(blogRef, {
                status: newStatus,
              });

              setBlogs(blogs.filter((blog) => blog.id !== blogId));
              setPendingCount((prev) => prev - 1);

              Alert.alert("Success", `Blog ${newStatus} successfully`, [
                { text: "OK" },
              ]);
            } catch (error) {
              console.error("Error updating blog status:", error);
              Alert.alert("Error", "Failed to update blog status", [
                { text: "OK" },
              ]);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Use useFocusEffect instead of useEffect
  useFocusEffect(
    useCallback(() => {
      if (isInitialMount.current) {
        // Only fetch on initial mount
        fetchBlogs(true);
        fetchPendingCount();
        isInitialMount.current = false;
      }
    }, [])
  );

  // Handle filter changes separately
  useFocusEffect(
    useCallback(() => {
      if (!isInitialMount.current) {
        // Only fetch when filters change and it's not the initial mount
        fetchBlogs(true);
      }
    }, [selectedCategory, selectedDistrict, searchQuery])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBlogs(true); // Force fetch on manual refresh
  }, [selectedCategory, selectedDistrict, searchQuery]);

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

  if (loading && blogs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchBlogs(true)}
        >
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
          <View style={styles.pendingCountContainer}>
            <Text style={styles.pendingCountText}>
              {user?.unsafeMetadata?.role !== "Admin"
                ? `Pending ${user?.unsafeMetadata?.role} Blogs: ${pendingCount}`
                : `Pending Blogs: ${pendingCount}`}
            </Text>
          </View>
          {user?.unsafeMetadata?.role === "Admin" && (
            <Category
              onCategorySelect={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
          )}
          <Location
            selectedDistrict={selectedDistrict}
            onDistrictSelect={handleDistrictSelect}
            onReset={handleDistrictReset}
          />
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <View key={blog.id} style={styles.blogCardContainer}>
                <BlogCard blog={blog} />
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleStatusChange(blog.id, "accepted")}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleStatusChange(blog.id, "rejected")}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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

// Styles remain the same

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
  actionButtonsContainer: {
    position: "absolute",
    bottom: 16,
    right: 40,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  acceptButton: {
    backgroundColor: "rgba(40, 167, 69, 0.9)", // Green with some transparency
  },
  rejectButton: {
    backgroundColor: "rgba(220, 53, 69, 0.9)", // Red with some transparency
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: "outfit-medium",
    textTransform: "uppercase",
  },
  pendingCountContainer: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pendingCountText: {
    color: "white",
    fontSize: 16,
    fontFamily: "outfit-medium",
    textAlign: "center",
  },
});
