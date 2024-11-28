// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
// } from "react-native";
// import { Search, X } from "lucide-react-native";
// import { Colors } from "../../constants/Colors";

// export default function Header({ onSearch }) {
//   const [searchQuery, setSearchQuery] = useState("");

//   const handleSearch = (query) => {
//     // Trigger search in parent component
//     onSearch(query);
//   };

//   const clearSearch = () => {
//     setSearchQuery("");
//     // Trigger search with empty string to show all blogs
//     onSearch("");
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerContent}>
//         <Image
//           source={require("./../../assets/images/Logo.png")}
//           style={styles.logo}
//         />
//         <View style={styles.searchWrapper}>
//           <Search size={20} color={Colors.PRIMARY} style={styles.searchIcon} />
//           <TextInput
//             placeholder="Search blogs..."
//             value={searchQuery}
//             onChangeText={(text) => {
//               setSearchQuery(text);
//               handleSearch(text);
//             }}
//             style={styles.searchInput}
//             placeholderTextColor="#888"
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
//               <X size={20} color="#888" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     paddingTop: 0,
//     backgroundColor: Colors.PRIMARY,
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   logo: {
//     width: 100,
//     height: 100,
//   },
//   searchWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "white",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     flex: 1,
//     marginLeft: 10,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontFamily: "outfit-medium",
//     fontSize: 16,
//     color: Colors.PRIMARY,
//   },
//   clearIcon: {
//     marginLeft: 10,
//   },
// });

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { Colors } from "../../constants/Colors";
import { debounce } from "lodash";

export default function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      onSearch(query);
    }, 500), // 500ms delay
    [onSearch]
  );

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    // Trigger debounced search
    debouncedSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
    // Immediately clear search and reset results
    onSearch("");
    // Cancel any pending debounced calls
    debouncedSearch.cancel();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Image
          source={require("./../../assets/images/Logo.png")}
          style={styles.logo}
        />
        <View style={styles.searchWrapper}>
          <Search size={20} color={Colors.PRIMARY} style={styles.searchIcon} />
          <TextInput
            placeholder="Search blogs..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
              <X size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: 0,
    backgroundColor: Colors.PRIMARY,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 1,
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  clearIcon: {
    marginLeft: 10,
  },
});
