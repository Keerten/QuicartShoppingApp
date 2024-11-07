import React, { useEffect, useState } from "react";
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
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

// Size configurations for the products
const sizeConfigurations = {
  clothing: {
    order: ["S", "M", "L", "XL"],
  },
  shoes: {
    order: ["7", "8", "9", "10"],
  },
};

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [selectedSize, setSelectedSize] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  const category = product.category;
  const subcategory = product.subCategory || "";
  const gender = product.gender || "";

  useEffect(() => {
    const title = `${gender ? `${gender}'s` : ""} ${category} ${
      subcategory ? `- ${subcategory}` : ""
    }`;
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, gender, category, subcategory]);

  const fetchProductData = async () => {
    try {
      const productRef = doc(db, category, product.uid);
      onSnapshot(productRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedProduct = docSnap.data();
          product.inventory = updatedProduct.inventory;
          setAvailableStock(
            selectedSize ? updatedProduct.inventory[selectedSize] : 0
          );
        }
      });
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const productId = product.name;
      const docRef = doc(db, "userProfile", user.uid, "favorites", productId);
      const docSnap = await getDoc(docRef);

      console.log("Checking favorite status for product:", productId);

      if (docSnap.exists()) {
        setIsFavorite(true);
        console.log(`Product ${productId} is already in favorites.`);
      } else {
        setIsFavorite(false);
        console.log(`Product ${productId} is not in favorites.`);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProductData();
      checkIfFavorite(); // Call this function on component mount
      console.log("User is logged in, checking favorites...");
    } else {
      console.log("User is not logged in.");
    }
  }, [user]);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", () => {
      // Reset selections when the screen is focused
      setSelectedSize(null);
      setQuantity(1);
      fetchProductData();
    });

    return unsubscribeFocus;
  }, [navigation]);

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
    setAvailableStock(product.inventory[size]);
    setQuantity(1); // Reset quantity to 1 when size changes
    console.log(
      `Size selected: ${size}, Available Stock: ${product.inventory[size]}`
    );
  };

  const handleAddToCart = async () => {
    if (!user) return;
    if ((category === "Clothing" || category === "Shoes") && !selectedSize)
      return;

    // Unique identifier for each product-size combination
    const cartItemId = `${product.uid}-${selectedSize || "default"}`;
    const cartRef = doc(db, "userProfile", user.uid, "cart", cartItemId);

    try {
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        // Product with the same size is already in cart, increment quantity
        const existingQuantity = cartSnap.data().quantity;
        const newQuantity = existingQuantity + quantity;

        // Update quantity in the cart
        await updateDoc(cartRef, { quantity: newQuantity });
        console.log(
          `Quantity updated for ${product.name} (Size: ${selectedSize}): New Quantity = ${newQuantity}`
        );
      } else {
        // Product with different size or new product, add it to cart
        const productToAdd = {
          ...product,
          size: selectedSize || null, // Ensure size is explicitly null if not selected
          quantity: quantity,
          addedAt: serverTimestamp(),
        };

        await setDoc(cartRef, productToAdd);
        console.log(
          `Product added to cart: ${product.name} (Size: ${
            selectedSize || "N/A"
          })`
        );
      }

      // Update the inventory
      const inventoryRef = doc(db, `${category}`, product.uid);
      const newStock =
        category === "Jewelry" ||
        category === "BeautyPersonalCare" ||
        category === "HealthWellness"
          ? product.inventory - quantity
          : product.inventory[selectedSize] - quantity;

      await updateDoc(inventoryRef, {
        [category === "Jewelry" ||
        category === "BeautyPersonalCare" ||
        category === "HealthWellness"
          ? "inventory"
          : `inventory.${selectedSize}`]: newStock,
      });

      // Show alert on successful addition
      Alert.alert("Success", `${product.name} has been added to your cart.`);

      // Reset size selection and quantity after adding to cart
      setSelectedSize(null);
      setQuantity(1);
      fetchProductData();
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const productId = product.name;
      if (!productId) {
        console.error("Product ID is missing.");
        return;
      }

      console.log("Toggling favorite status for product:", productId);

      const docRef = doc(db, "userProfile", user.uid, "favorites", productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await deleteDoc(docRef); // Remove from favorites
        setIsFavorite(false);
        console.log(`Product ${productId} removed from favorites!`);
      } else {
        await setDoc(docRef, {
          ...product, // Spread the entire product object
          addedAt: serverTimestamp(), // Add timestamp
        });
        setIsFavorite(true);
        console.log(`Product ${productId} added to favorites!`);
      }
      fetchProductData();
    } catch (error) {
      console.error("Error toggling favorite status:", error);
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
          {product.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.image} />
          ))}
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

        {(category === "Clothing" || category === "Shoes") && (
          <>
            <Text style={styles.sizes}>Available Sizes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sizeConfigurations[category.toLowerCase()].order.map(
                (size, index) => {
                  const isAvailable = product.inventory[size] > 0; // Check if the size is available
                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.sizeButton,
                        selectedSize === size && styles.selectedSize,
                        !isAvailable && styles.disabledButton,
                      ]}
                      onPress={() => {
                        if (isAvailable) {
                          handleSizeSelection(size);
                        } else {
                          console.log(`Size ${size} is not available.`);
                        }
                      }}
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
                }
              )}
            </ScrollView>

            {selectedSize && (
              <Text style={styles.stockText}>
                Available Stock: {availableStock}
              </Text>
            )}
          </>
        )}

        {/* Quantity Selector - Hide for clothing and shoes unless size is selected */}
        {(category === "Jewelry" ||
          category === "BeautyPersonalCare" ||
          category === "HealthWellness") && (
          <Text style={styles.stockText}>
            Available Stock: {product.inventory}
          </Text>
        )}

        {(category !== "Clothing" && category !== "Shoes") || selectedSize ? (
          <View style={styles.quantitySelector}>
            <Text style={styles.quantityLabel}>Quantity:</Text>

            {/* Minus Button */}
            <Pressable
              style={styles.quantityButton}
              onPress={() => {
                const newQuantity = Math.max(1, quantity - 1);
                setQuantity(newQuantity);
              }}
              disabled={quantity === 1} // Disable when quantity is 1
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  quantity === 1 && styles.disabledText, // Gray out text when quantity is 1
                ]}
              >
                -
              </Text>
            </Pressable>

            {/* Quantity Text */}
            <Text style={styles.quantityText}>{quantity}</Text>

            {/* Plus Button */}
            <Pressable
              style={styles.quantityButton}
              onPress={() =>
                setQuantity(Math.min(availableStock, quantity + 1))
              }
              disabled={quantity >= availableStock}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  quantity >= availableStock && styles.disabledText, // Gray out text if at max stock
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={[
            styles.button,
            (category === "Clothing" || category === "Shoes") &&
              !selectedSize &&
              styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={
            (category === "Clothing" || category === "Shoes") && !selectedSize
          }
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
