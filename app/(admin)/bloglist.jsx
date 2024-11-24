import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

export default function BlogApprovalScreen() {
  // Sample data - replace with your actual blog data
  const [pendingBlogs, setPendingBlogs] = useState([
    {
      id: "1",
      title: "Understanding React Native Navigation",
      author: "John Doe",
      date: "2024-03-23",
      excerpt:
        "A comprehensive guide to implementing navigation in React Native...",
      thumbnail: "https://example.com/image1.jpg",
    },
    {
      id: "2",
      title: "Best Practices for State Management",
      author: "Jane Smith",
      date: "2024-03-22",
      excerpt: "Learn about different state management approaches in React...",
      thumbnail: "https://example.com/image2.jpg",
    },
    // Add more blog posts as needed
  ]);

  const handleApprove = (blogId) => {
    Alert.alert("Approve Blog", "Are you sure you want to approve this blog?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Approve",
        onPress: () => {
          // Here you would typically make an API call to approve the blog
          setPendingBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.id !== blogId)
          );
          Alert.alert("Success", "Blog has been approved");
        },
      },
    ]);
  };

  const handleReject = (blogId) => {
    Alert.alert("Reject Blog", "Are you sure you want to reject this blog?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          // Here you would typically make an API call to reject the blog
          setPendingBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.id !== blogId)
          );
          Alert.alert("Success", "Blog has been rejected");
        },
      },
    ]);
  };

  const renderBlogItem = ({ item }) => (
    <View style={styles.blogCard}>
      <View style={styles.blogHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>By {item.author}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <Text style={styles.excerpt} numberOfLines={2}>
        {item.excerpt}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Blogs</Text>
        <Text style={styles.subTitle}>
          {pendingBlogs.length} blogs waiting for approval
        </Text>
      </View>

      {pendingBlogs.length > 0 ? (
        <FlatList
          data={pendingBlogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No pending blogs to review</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  blogCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blogHeader: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  excerpt: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
