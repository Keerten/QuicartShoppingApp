import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
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
            category: "Health & Wellness",
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
            category: "Beauty & Personal Care",
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
          {/* Welcome message */}
          <Text style={styles.welcomeMessage}>
            Welcome to Quicart Shopping App!
          </Text>

          {/* Clothing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clothes</Text>
            <FlatList
              data={clothes}
              renderItem={renderItem}
              keyExtractor={(item) => item.uid}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListHorizontal}
            />
          </View>

          {/* Shoes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shoes</Text>
            <FlatList
              data={shoes}
              renderItem={renderItem}
              keyExtractor={(item) => item.uid}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListHorizontal}
            />
          </View>

          {/* Jewelry Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jewelry</Text>
            <FlatList
              data={jewelry}
              renderItem={renderItem}
              keyExtractor={(item) => item.uid}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListHorizontal}
            />
          </View>

          {/* Health & Wellness Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health & Wellness</Text>
            <FlatList
              data={healthProducts}
              renderItem={renderItem}
              keyExtractor={(item) => item.uid}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListHorizontal}
            />
          </View>

          {/* Beauty & Personal Care Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beauty & Personal Care</Text>
            <FlatList
              data={beautyProducts}
              renderItem={renderItem}
              keyExtractor={(item) => item.uid}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListHorizontal}
            />
          </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    }),
    ...(Platform.OS === "android" && {
      elevation: 3,
      shadowColor: "#f2f2f2",
    }),
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
