// ViewAllScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ViewAll = ({ route }) => {
  const { category, products } = route.params;
  const navigation = useNavigation();

  const [selectedGender, setSelectedGender] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    navigation.setOptions({ title: `Explore Our Collection: ${category}` });
  }, [navigation, category]);

  useEffect(() => {
    if (selectedGender === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) => product.gender === selectedGender)
      );
    }
  }, [selectedGender, products]);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate("ProductDetails", { product: item })}
      style={styles.cardContainer}
    >
      <Image
        source={{ uri: item.images?.[0] || "default_img_url" }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {(category === "Clothes" || category === "Shoes") && (
        <View style={styles.filterContainer}>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[
                styles.genderButton,
                selectedGender === "Men" && styles.selectedButton,
              ]}
              onPress={() => setSelectedGender("Men")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedGender === "Men" && styles.selectedButtonText,
                ]}
              >
                Men
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                selectedGender === "Women" && styles.selectedButton,
              ]}
              onPress={() => setSelectedGender("Women")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedGender === "Women" && styles.selectedButtonText,
                ]}
              >
                Women
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                selectedGender === "Kids" && styles.selectedButton,
              ]}
              onPress={() => setSelectedGender("Kids")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedGender === "Kids" && styles.selectedButtonText,
                ]}
              >
                Kids
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                selectedGender === "All" && styles.selectedButton,
              ]}
              onPress={() => setSelectedGender("All")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedGender === "All" && styles.selectedButtonText,
                ]}
              >
                All
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.flatList}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  flatList: {
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    flex: 1,
    overflow: "hidden",
    height: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 14,
    color: "#666",
  },
  filterContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: "22%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedButton: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  buttonText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  selectedButtonText: {
    color: "#fff",
  },
});

export default ViewAll;
