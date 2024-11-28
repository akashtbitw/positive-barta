// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   Dimensions,
// } from "react-native";
// import { Colors } from "../../constants/Colors";
// import { districts } from "../../constants/Districts";

// export default function Location({
//   selectedDistrict,
//   onDistrictSelect,
//   onReset,
// }) {
//   const [modalVisible, setModalVisible] = useState(false);

//   const ITEM_HEIGHT = 56;
//   const VISIBLE_ITEMS = 8;

//   const getItemLayout = useCallback(
//     (data, index) => ({
//       length: ITEM_HEIGHT,
//       offset: ITEM_HEIGHT * index,
//       index,
//     }),
//     []
//   );

//   const handleDistrictSelect = (district) => {
//     onDistrictSelect(district);
//     setModalVisible(false);
//   };

//   const getInitialScrollIndex = () => {
//     if (!selectedDistrict) return 0;
//     const index = districts.indexOf(selectedDistrict);
//     return Math.max(
//       0,
//       Math.min(
//         index - Math.floor(VISIBLE_ITEMS / 2),
//         districts.length - VISIBLE_ITEMS
//       )
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Location</Text>
//         <TouchableOpacity onPress={onReset}>
//           <Text style={styles.headerAction}>Reset</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.contentContainer}>
//         <TouchableOpacity
//           style={styles.dropdown}
//           onPress={() => setModalVisible(true)}
//         >
//           <Text style={styles.dropdownLabel}>Selected District</Text>
//           <Text style={styles.dropdownText}>
//             {selectedDistrict || "Choose a district"}
//           </Text>
//         </TouchableOpacity>

//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Select A District</Text>
//               <FlatList
//                 style={styles.flatList}
//                 data={districts}
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={[
//                       styles.modalItem,
//                       selectedDistrict === item && styles.modalItemSelected,
//                     ]}
//                     onPress={() => handleDistrictSelect(item)}
//                   >
//                     <Text
//                       style={[
//                         styles.modalItemText,
//                         selectedDistrict === item &&
//                           styles.modalItemTextSelected,
//                       ]}
//                     >
//                       {item}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//                 getItemLayout={getItemLayout}
//                 initialScrollIndex={getInitialScrollIndex()}
//                 initialNumToRender={VISIBLE_ITEMS}
//               />
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Text style={styles.closeButtonText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </View>
//   );
// }

// const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 15,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontFamily: "outfit-bold",
//   },
//   headerAction: {
//     color: Colors.PRIMARY,
//     fontFamily: "outfit-medium",
//   },
//   contentContainer: {
//     marginHorizontal: 20,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 12,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   dropdown: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     padding: 15,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   dropdownLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     fontFamily: "outfit-medium",
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: "#333",
//     fontFamily: "outfit-medium",
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     maxHeight: screenHeight * 0.8,
//     width: screenWidth,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontFamily: "outfit-bold",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   flatList: {
//     flexGrow: 0,
//     maxHeight: screenHeight * 0.6,
//   },
//   modalItem: {
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     height: 56, // Make sure this matches ITEM_HEIGHT
//   },
//   modalItemSelected: {
//     backgroundColor: `${Colors.PRIMARY}15`,
//   },
//   modalItemText: {
//     fontSize: 16,
//     fontFamily: "outfit-medium",
//     color: "#333",
//   },
//   modalItemTextSelected: {
//     color: Colors.PRIMARY,
//   },
//   closeButton: {
//     marginTop: 15,
//     backgroundColor: Colors.PRIMARY,
//     padding: 15,
//     borderRadius: 16,
//     alignItems: "center",
//   },
//   closeButtonText: {
//     color: "white",
//     fontFamily: "outfit-bold",
//     fontSize: 16,
//   },
// });

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { districts } from "../../constants/Districts";

export default function Location({
  selectedDistrict,
  onDistrictSelect,
  onReset,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const ITEM_HEIGHT = 56;
  const VISIBLE_ITEMS = 8;

  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const handleDistrictSelect = (district) => {
    onDistrictSelect(district);
    setModalVisible(false);
  };

  const getInitialScrollIndex = () => {
    if (!selectedDistrict) return 0;
    const index = districts.indexOf(selectedDistrict);
    return Math.max(
      0,
      Math.min(
        index - Math.floor(VISIBLE_ITEMS / 2),
        districts.length - VISIBLE_ITEMS
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location</Text>
        <TouchableOpacity onPress={onReset}>
          <Text style={styles.headerAction}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {selectedDistrict || "Select a District"}
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select A District</Text>
              <FlatList
                style={styles.flatList}
                data={districts}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedDistrict === item && styles.modalItemSelected,
                    ]}
                    onPress={() => handleDistrictSelect(item)}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedDistrict === item &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                getItemLayout={getItemLayout}
                initialScrollIndex={getInitialScrollIndex()}
                initialNumToRender={VISIBLE_ITEMS}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "outfit-bold",
  },
  headerAction: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
  },
  contentContainer: {
    marginHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 50, // Ensures the dropdown has a minimum height
  },
  dropdownText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "outfit-medium",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: screenHeight * 0.8,
    width: screenWidth,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    marginBottom: 15,
    textAlign: "center",
  },
  flatList: {
    flexGrow: 0,
    maxHeight: screenHeight * 0.6,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 56, // Make sure this matches ITEM_HEIGHT
  },
  modalItemSelected: {
    backgroundColor: `${Colors.PRIMARY}15`,
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: "outfit-medium",
    color: "#333",
  },
  modalItemTextSelected: {
    color: Colors.PRIMARY,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontFamily: "outfit-bold",
    fontSize: 16,
  },
});
