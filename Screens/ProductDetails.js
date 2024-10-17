import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { db } from "../Configs/FirebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons"; // For favorite icon

const { width } = Dimensions.get("window");

const sizeConfigurations = {
  clothing: {
    order: ["S", "M", "L", "XL", "XXL"],
  },
  shoes: {
    order: ["7", "8", "9", "10", "11", "12"],
  },
};

// ProductDetails Component
const ProductDetails = ({ route }) => {
  const { product } = route.params;
  const [selectedSize, setSelectedSize] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  // Determine category
  const category = product.clothingName
    ? "clothing"
    : product.shoeName
    ? "shoes"
    : product.jewelryName
    ? "jewelry"
    : product.healthWellnessName
    ? "healthwellness"
    : product.beautyPersonalCareName
    ? "beautypersonalcare"
    : null;

  const sizeConfig = sizeConfigurations[category];
  const availableSizes =
    product.sizes && typeof product.sizes === "object"
      ? sizeConfig?.order.filter((size) => product.sizes[size] > 0)
      : [];

  const checkIfFavorite = async () => {
    try {
      const productId =
        product.clothingName ||
        product.shoeName ||
        product.jewelryName ||
        product.productName;
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
      checkIfFavorite(); // Call this function on component mount
      console.log("User is logged in, checking favorites...");
    } else {
      console.log("User is not logged in.");
    }
  }, [user]);

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
    setAvailableStock(product.sizes[size]);
    setQuantity(1); // Reset quantity to 1 when size changes
    console.log(
      `Size selected: ${size}, Available Stock: ${product.sizes[size]}`
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    if ((category === "clothing" || category === "shoes") && !selectedSize) {
      console.error("No size selected.");
      return;
    }

    // Log the current product state before adding it to the cart
    console.log("Current product details:", product);

    // Create productToAdd object with necessary properties
    const productToAdd = {
      ...product,
      size: selectedSize || null, // Ensure size is explicitly null if not selected
      quantity: quantity,
      addedAt: serverTimestamp(), // Add timestamp
    };

    console.log("Adding product to cart:", productToAdd);

    try {
      const cartRef = collection(db, "userProfile", user.uid, "cart");
      // Using setDoc with a unique identifier
      await setDoc(doc(cartRef), productToAdd); // This assumes you're okay with overwriting any existing document with the same ID
      console.log(
        `Product added to cart successfully: ${
          productToAdd.clothingName ||
          productToAdd.shoeName ||
          productToAdd.jewelryName ||
          productToAdd.productName
        }`
      );
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const productId =
        product.clothingName ||
        product.shoeName ||
        product.jewelryName ||
        product.productName;
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
          <Text style={styles.name}>
            {product.clothingName ||
              product.shoeName ||
              product.jewelryName ||
              product.productName}
          </Text>
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

        {(category === "clothing" || category === "shoes") && (
          <>
            <Text style={styles.sizes}>Available Sizes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sizeConfig?.order.map((size, index) => {
                const isAvailable = product.sizes[size] > 0;
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
              })}
            </ScrollView>

            {selectedSize && (
              <Text style={styles.stockText}>
                Available Stock: {availableStock}
              </Text>
            )}
          </>
        )}

        {/* Quantity Selector - Hide for clothing and shoes unless size is selected */}
        {(!category ||
          category === "jewelry" ||
          category === "healthwellness" ||
          category === "beautypersonalcare" ||
          ((category === "clothing" || category === "shoes") &&
            selectedSize)) && (
          <View style={styles.quantitySelector}>
            <Text style={styles.quantityLabel}>Quantity:</Text>

            {/* Minus Button */}
            <Pressable
              style={styles.quantityButton}
              onPress={() => {
                const newQuantity = Math.max(1, quantity - 1);
                setQuantity(newQuantity);
                console.log(`Quantity decreased: ${newQuantity}`);
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
              onPress={() => {
                const newQuantity = Math.min(availableStock, quantity + 1);
                setQuantity(newQuantity);
                console.log(`Quantity increased: ${newQuantity}`);
              }}
              disabled={quantity >= availableStock} // Disable if quantity reaches available stock
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
        )}

        <Pressable
          style={[
            styles.button,
            (category === "clothing" || category === "shoes") &&
              !selectedSize &&
              styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={
            (category === "clothing" || category === "shoes") && !selectedSize
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
    padding: 15,
    backgroundColor: "#000",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
  favoriteButton: {
    padding: 10,
  },
});

export default ProductDetails;
