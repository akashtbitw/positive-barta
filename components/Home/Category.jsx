import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "../../constants/Colors";
import CategoryItem from "./CategoryItem";
import { useCategoryList } from "../../hooks/useCategoryList";

const { width } = Dimensions.get("window");
const PADDING_HORIZONTAL = 20;
const numColumns = 4;
const GRID_SPACING = 16;
const GRID_VERTICAL_SPACING = 24;
const ITEM_WIDTH =
  (width - PADDING_HORIZONTAL * 2 - GRID_SPACING * (numColumns - 1)) /
  numColumns;

export default function Category({ onCategorySelect, selectedCategory }) {
  const { categoryList } = useCategoryList();
  const [showAll, setShowAll] = useState(false);

  const toggleView = () => {
    setShowAll(!showAll);
  };

  const initialCategories = categoryList.slice(0, 4);

  const handleCategoryPress = (categoryName) => {
    // If the same category is selected again, clear the selection
    if (selectedCategory === categoryName) {
      onCategorySelect(null);
    } else {
      // Otherwise, set the new category
      onCategorySelect(categoryName);
    }
  };

  const renderItem = ({ item, index }) => {
    const isLastRow =
      showAll &&
      index >= Math.floor(categoryList.length / numColumns) * numColumns;

    return (
      <View
        style={[
          styles.item,
          showAll
            ? {
                width: ITEM_WIDTH,
                marginRight: (index + 1) % numColumns === 0 ? 0 : GRID_SPACING,
                marginBottom: isLastRow ? 0 : GRID_VERTICAL_SPACING,
              }
            : {
                width: ITEM_WIDTH,
                marginRight: index === 3 ? 0 : GRID_SPACING,
              },
        ]}
      >
        <CategoryItem
          category={item}
          onPress={() => handleCategoryPress(item.name)}
          isSelected={selectedCategory === item.name}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Category</Text>
        <TouchableOpacity onPress={toggleView}>
          <Text style={styles.viewAllText}>
            {showAll ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        key={showAll ? "grid" : "list"}
        data={showAll ? categoryList : initialCategories}
        horizontal={!showAll}
        numColumns={showAll ? numColumns : 1}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!showAll}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = {
  container: {
    width: "100%",
  },
  header: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "outfit-bold",
  },
  viewAllText: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
  },
  item: {
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
  },
};
