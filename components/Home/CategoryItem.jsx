// import { View, Image, Text, StyleSheet } from "react-native";
// import React from "react";

// export default function CategoryItem({ category }) {
//   return (
//     <View style={styles.container}>
//       <Image source={{ uri: category.icon }} style={styles.icon} />
//       <Text style={styles.text} numberOfLines={1}>
//         {category.name}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     alignItems: "center",
//     width: "100%",
//   },
//   icon: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     marginBottom: 8,
//   },
//   text: {
//     fontSize: 14,
//     fontFamily: "outfit-medium",
//     textAlign: "center",
//   },
// });
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";

const CategoryItem = React.memo(({ category, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: category.icon }} style={styles.icon} />
      <Text
        style={[styles.text, isSelected && styles.selectedText]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
});

CategoryItem.displayName = "CategoryItem";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    padding: 8,
    borderRadius: 12,
  },
  selectedContainer: {
    backgroundColor: `${Colors.PRIMARY}20`,
  },
  icon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: "outfit-medium",
    textAlign: "center",
  },
  selectedText: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-bold",
  },
});

export default CategoryItem;
