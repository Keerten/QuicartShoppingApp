import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import { db } from "../Configs/FirebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

// Size configurations for the products
const sizeConfigurations = {
  Clothing: ["S", "M", "L", "XL"],
  Shoes: ["7", "8", "9", "10"],
};

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [selectedSize, setSelectedSize] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  const { category, subCategory = "", gender = "", uid } = product;

  if (!category || !uid) {
    Alert.alert("Error", "Invalid product data.");
    return null;
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${gender ? `${gender}'s` : ""} ${category} ${
        subCategory ? `- ${subCategory}` : ""
      }`,
    });
  }, [navigation, gender, category, subCategory]);

  const fetchProductData = useCallback(() => {
    try {
      const productRef = doc(db, category, uid);
      const unsubscribe = onSnapshot(productRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedProduct = docSnap.data();
          product.inventory = updatedProduct.inventory;

          if (["Clothing", "Shoes"].includes(category) && selectedSize) {
            setAvailableStock(updatedProduct.inventory[selectedSize] || 0);
          } else {
            setAvailableStock(updatedProduct.inventory || 0);
          }
        } else {
          Alert.alert("Error", "Product not found.");
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching product data:", error);
      Alert.alert("Error", "Failed to load product data.");
    }
  }, [category, selectedSize, uid]);

  const checkIfFavorite = useCallback(async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    try {
      const docRef = doc(db, "userProfile", user.uid, "favorites", uid);
      const docSnap = await getDoc(docRef);
      setIsFavorite(docSnap.exists());
    } catch (error) {
      console.error("Error checking favorite status:", error);
      Alert.alert("Error", "Failed to check favorite status.");
    }
  }, [uid, user]);

  useEffect(() => {
    if (user) {
      const unsubscribe = fetchProductData();
      checkIfFavorite();
      return () => unsubscribe && unsubscribe();
    }
  }, [user, fetchProductData, checkIfFavorite]);

  const handleSizeSelection = (size) => {
    if (product.inventory[size] > 0) {
      setSelectedSize(size);
      setAvailableStock(product.inventory[size]);
      setQuantity(1);
    } else {
      Alert.alert("Out of Stock", `Size ${size} is currently out of stock.`);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    if (["Clothing", "Shoes"].includes(category) && !selectedSize) {
      Alert.alert("Error", "Please select a size.");
      return;
    }

    if (availableStock < 1) {
      Alert.alert("Error", "This item is currently out of stock.");
      return;
    }

    const cartItemId = `${uid}-${selectedSize || "default"}`;
    const cartRef = doc(db, "userProfile", user.uid, "cart", cartItemId);

    try {
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const newQuantity = cartSnap.data().quantity + quantity;
        if (newQuantity > availableStock) {
          Alert.alert(
            "Insufficient Stock",
            `Only ${availableStock} items are available.`
          );
          return;
        }
        await updateDoc(cartRef, { quantity: newQuantity });
      } else {
        await setDoc(cartRef, {
          uid,
          category,
          quantity,
          addedAt: serverTimestamp(),
          ...(selectedSize && { size: selectedSize }),
        });
      }

      Alert.alert("Success", `${product.name} added to your cart.`);
      setSelectedSize(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Alert.alert("Error", "Failed to add product to cart.");
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const docRef = doc(db, "userProfile", user.uid, "favorites", uid);

    try {
      if (isFavorite) {
        await deleteDoc(docRef);
        setIsFavorite(false);
      } else {
        await setDoc(docRef, {
          uid,
          category,
          addedAt: serverTimestamp(),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      Alert.alert("Error", "Failed to update favorite status.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageCarousel}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.image} />
            ))
          ) : (
            <Text>No images available.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{product.name}</Text>
          <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={30}
              color={isFavorite ? "red" : "black"}
            />
          </Pressable>
        </View>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.description}>{product.description}</Text>

        {["Jewelry", "BeautyPersonalCare", "HealthWellness"].includes(
          category
        ) && (
          <Text style={styles.stockText}>
            Available Stock: {availableStock}
          </Text>
        )}

        {["Clothing", "Shoes"].includes(category) && (
          <>
            <Text style={styles.sizes}>Available Sizes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sizeConfigurations[category].map((size, index) => {
                const isAvailable = product.inventory[size] > 0;
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.sizeButton,
                      selectedSize === size && styles.selectedSize,
                      !isAvailable && styles.disabledButton,
                    ]}
                    onPress={() => isAvailable && handleSizeSelection(size)}
                    disabled={!isAvailable}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === size && styles.selectedText,
                        !isAvailable && styles.disabledText,
                      ]}
                    >
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedSize && (
              <Text style={styles.stockText}>
                Available Stock: {availableStock}
              </Text>
            )}
          </>
        )}

        {((category !== "Clothing" && category !== "Shoes") || selectedSize) &&
          availableStock > 0 && (
            <View style={styles.quantitySelector}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    quantity === 1 && styles.disabledText,
                  ]}
                >
                  -
                </Text>
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
                disabled={quantity >= availableStock}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    quantity >= availableStock && styles.disabledText,
                  ]}
                >
                  +
                </Text>
              </Pressable>
            </View>
          )}

        <Pressable
          style={[
            styles.button,
            (((category === "Clothing" || category === "Shoes") &&
              !selectedSize) ||
              availableStock === 0) &&
              styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={availableStock === 0}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  imageCarousel: {
    position: "relative",
  },
  image: {
    width: width,
    height: 600,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 20,
    color: "#888",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
  },
  sizes: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  sizeButton: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    borderRadius: 5,
  },
  selectedSize: {
    backgroundColor: "#000",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  sizeText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  disabledText: {
    color: "#aaa",
  },
  stockText: {
    marginVertical: 10,
    fontSize: 16,
    color: "#666",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  quantityLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  quantityButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
  },
  quantityText: {
    fontSize: 18,
  },
  button: {
    paddingVertical: 15,
    backgroundColor: "#000",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  favoriteButton: {
    marginLeft: 10,
  },
});
export default ProductDetails;
