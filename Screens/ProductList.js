import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";

const ProductList = () => {
  const [clothes, setClothes] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [jewelry, setJewelry] = useState([]);
  const [healthProducts, setHealthProducts] = useState([]);
  const [beautyProducts, setBeautyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProductsFromFirebase = async () => {
      try {
        const clothesData = [];
        const shoesData = [];
        const jewelryData = [];
        const healthData = [];
        const beautyData = [];

        // Fetch Clothing data
        const clothingSnapshot = await getDocs(collection(db, "Clothing"));
        clothingSnapshot.forEach((doc) => {
          const data = doc.data();
          clothesData.push({
            ...data,
            category: "Clothing",
            uid: doc.id,
          });
        });

        // Fetch Shoes data
        const shoesSnapshot = await getDocs(collection(db, "Shoes"));
        shoesSnapshot.forEach((doc) => {
          const data = doc.data();
          shoesData.push({
            ...data,
            category: "Shoes",
            uid: doc.id,
          });
        });

        // Fetch Jewelry data
        const jewelrySnapshot = await getDocs(collection(db, "Jewelry"));
        jewelrySnapshot.forEach((doc) => {
          const data = doc.data();
          jewelryData.push({
            ...data,
            category: "Jewelry",
            uid: doc.id,
          });
        });

        // Fetch Health & Wellness data
        const healthSnapshot = await getDocs(collection(db, "HealthWellness"));
        healthSnapshot.forEach((doc) => {
          const data = doc.data();
          healthData.push({
            ...data,
            category: "HealthWellness",
            uid: doc.id,
          });
        });

        // Fetch Beauty & Personal Care data
        const beautySnapshot = await getDocs(
          collection(db, "BeautyPersonalCare")
        );
        beautySnapshot.forEach((doc) => {
          const data = doc.data();
          beautyData.push({
            ...data,
            category: "BeautyPersonalCare",
            uid: doc.id,
          });
        });

        setClothes(clothesData);
        setShoes(shoesData);
        setJewelry(jewelryData);
        setHealthProducts(healthData);
        setBeautyProducts(beautyData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products from Firestore:", error);
      }
    };

    fetchProductsFromFirebase();
  }, []);

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

  const handleViewAll = (category, products) => {
    navigation.navigate("ViewAll", { category, products });
  };

  const renderCategorySection = (title, data) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={() => handleViewAll(title, data)}>
          <Text style={styles.viewAllButton}>View All</Text>
        </Pressable>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListHorizontal}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.welcomeMessage}>
            Welcome to Quicart Shopping App!
          </Text>

          {renderCategorySection("Clothes", clothes)}
          {renderCategorySection("Shoes", shoes)}
          {renderCategorySection("Jewelry", jewelry)}
          {renderCategorySection("Health & Wellness", healthProducts)}
          {renderCategorySection("Beauty & Personal Care", beautyProducts)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "left",
    color: "#333",
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  viewAllButton: {
    fontSize: 16,
    color: "#337ab7",
  },
  flatListHorizontal: {
    paddingLeft: 10,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
    width: 150,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#888",
  },
});

export default ProductList;
