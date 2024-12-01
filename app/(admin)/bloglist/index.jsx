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
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../configs/FirebaseConfig";
import Header from "../../../components/Home/Header";
import Category from "../../../components/Home/Category";
import Location from "../../../components/Home/Location";
import BlogCard from "../../../components/Home/BlogCard";
import { ScrollView } from "react-native";
import { ArrowUp } from "lucide-react-native";
import { Colors } from "../../../constants/Colors";
import { useFocusEffect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function Home() {
  const scrollViewRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const isInitialMount = useRef(true);
  const lastDoc = useRef(null);
  const hasMore = useRef(true);
  const BLOGS_PER_PAGE = 10;
  const { user } = useUser();

  const createBlogsQuery = (lastDocument = null) => {
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

    let baseQuery = query(
      collection(db, "blogs"),
      ...conditions,
      orderBy("createdAt", "desc"),
      orderBy("title"),
      limit(BLOGS_PER_PAGE)
    );

    if (lastDocument) {
      baseQuery = query(baseQuery, startAfter(lastDocument));
    }

    return baseQuery;
  };

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
    if (blogs.length > 0 && !forceFetch) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const blogsQuery = createBlogsQuery();
      const querySnapshot = await getDocs(blogsQuery);

      hasMore.current = querySnapshot.docs.length === BLOGS_PER_PAGE;
      lastDoc.current =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

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

  const loadMoreBlogs = async () => {
    if (loadingMore || !hasMore.current || !lastDoc.current) return;

    try {
      setLoadingMore(true);
      const blogsQuery = createBlogsQuery(lastDoc.current);
      const querySnapshot = await getDocs(blogsQuery);

      hasMore.current = querySnapshot.docs.length === BLOGS_PER_PAGE;
      lastDoc.current =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      const newBlogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: formatDate(doc.data().createdAt),
      }));

      setBlogs((prevBlogs) => [...prevBlogs, ...newBlogsData]);
    } catch (err) {
      console.error("Error loading more blogs:", err);
      setError("Failed to load more blogs");
    } finally {
      setLoadingMore(false);
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

  const handleFilterChange = useCallback(() => {
    lastDoc.current = null;
    hasMore.current = true;
    setBlogs([]);
    fetchBlogs(true);
  }, [selectedCategory, selectedDistrict, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (isInitialMount.current) {
        fetchBlogs(true);
        fetchPendingCount();
        isInitialMount.current = false;
      }
    }, [])
  );

  React.useEffect(() => {
    if (!isInitialMount.current) {
      handleFilterChange();
    }
  }, [selectedCategory, selectedDistrict, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    hasMore.current = true;
    lastDoc.current = null;
    fetchBlogs(true);
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

  const renderContent = () => {
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

    if (blogs.length === 0 && !loading) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No blogs found</Text>
        </View>
      );
    }

    return (
      <>
        {blogs.map((blog) => (
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
        ))}
        {hasMore.current && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMoreBlogs}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loadMoreButtonText}>Load More</Text>
            )}
          </TouchableOpacity>
        )}
      </>
    );
  };

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
          {renderContent()}
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
  loadMoreButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: "center",
  },
  loadMoreButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "outfit-medium",
  },
});
