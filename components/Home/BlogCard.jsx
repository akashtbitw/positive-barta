import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";

export default function BlogCard({ blog }) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <Image
        source={
          blog.imageUrl
            ? { uri: blog.imageUrl }
            : require("../../assets/images/placeholder.png") // Adjust the path based on your file structure
        }
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <View style={styles.metaContainer}>
          <Text style={styles.readTime}>{blog.readingTime}</Text>
          <Text style={styles.date}>{blog.date}</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{blog.category}</Text>
          <Text style={styles.district}>{blog.district}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {blog.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {blog.content}
        </Text>
        <View style={styles.authorContainer}>
          <Text style={styles.author}>
            By {blog.individualName || blog.organisationName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  contentContainer: {
    padding: 15,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  category: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontFamily: "outfit-medium",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  district: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontFamily: "outfit-medium",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readTime: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontFamily: "outfit-medium",
  },
  date: {
    color: "#666",
    fontSize: 12,
    fontFamily: "outfit-regular",
  },
  title: {
    fontSize: 18,
    fontFamily: "outfit-bold",
    marginBottom: 8,
    color: "#333",
  },
  excerpt: {
    fontSize: 14,
    fontFamily: "outfit-regular",
    color: "#666",
    lineHeight: 20,
  },
  authorContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  author: {
    fontSize: 12,
    fontFamily: "outfit-medium",
    color: Colors.PRIMARY,
  },
});
