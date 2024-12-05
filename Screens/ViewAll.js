import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ViewAll = ({ route }) => {
  const { category, products } = route.params;
  const navigation = useNavigation();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Filter arrays
  const genderFilters = ["All", "Men", "Women", "Kids"];
  const beautyFilters = [
    "All",
    "Makeup",
    "Nails",
    "Brushes",
    "Skincare",
    "Haircare",
    "Fragrance",
  ];
  const jewelryFilters = [
    "All",
    "Necklace",
    "Rings",
    "Bracelet",
    "Bangle",
    "Earrings",
  ];
  const healthWellnessFilters = [
    "All",
    "Medicine",
    "Exercise Equipment",
    "Massaging Devices",
    "Supplements",
    "Yoga Accessories",
  ];

  useEffect(() => {
    navigation.setOptions({ title: `Explore Our Collection: ${category}` });
  }, [navigation, category]);

  useEffect(() => {
    if (selectedFilter === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        if (category === "Beauty & Personal Care") {
          return (
            product.subcategory?.toLowerCase() === selectedFilter.toLowerCase()
          );
        } else if (category === "Jewelry") {
          return (
            product.subcategory?.toLowerCase() === selectedFilter.toLowerCase()
          );
        } else if (category === "Health & Wellness") {
          return (
            product.subcategory?.toLowerCase() === selectedFilter.toLowerCase()
          );
        } else if (category === "Clothes" || category === "Shoes") {
          return product.gender === selectedFilter;
        }
        return false;
      });

      setFilteredProducts(filtered);
    }
  }, [selectedFilter, products, category]);

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
      {/* Gender filters for Clothes & Shoes */}
      {(category === "Clothes" || category === "Shoes") && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonGroup}>
              {genderFilters.map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedFilter === filter && styles.selectedButtonText,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Beauty & Personal Care filters */}
      {category === "Beauty & Personal Care" && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonGroup}>
              {beautyFilters.map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedFilter === filter && styles.selectedButtonText,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Jewelry filters */}
      {category === "Jewelry" && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonGroup}>
              {jewelryFilters.map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedFilter === filter && styles.selectedButtonText,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Health & Wellness filters */}
      {category === "Health & Wellness" && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonGroup}>
              {healthWellnessFilters.map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedFilter === filter && styles.selectedButtonText,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
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
    paddingVertical: 10,
    paddingHorizontal: 5,
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
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
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
