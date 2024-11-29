import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useRef, useState, useCallback } from "react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import Header from "../../components/Home/Header";
import Category from "../../components/Home/Category";
import Location from "../../components/Home/Location";
import BlogCard from "../../components/Home/BlogCard";
import { ScrollView } from "react-native";
import { ArrowUp } from "lucide-react-native";
import { Colors } from "../../constants/Colors";
import { useFocusEffect, Stack } from "expo-router";

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
  const isInitialMount = useRef(true);

  const fetchBlogs = async (forceFetch = false) => {
    // If we have data and it's not a forced fetch, don't fetch again
    if (blogs.length > 0 && !forceFetch) {
      setLoading(false);
      return;
    }

    try {
      const conditions = [where("status", "==", "pending")];

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

  // Use useFocusEffect instead of useEffect
  useFocusEffect(
    useCallback(() => {
      if (isInitialMount.current) {
        // Only fetch on initial mount
        fetchBlogs(true);
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
            blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
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
    bottom: 20,
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
});
