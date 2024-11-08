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
  onSnapshot,
  serverTimestamp,
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

  const fetchProductData = () => {
    const productRef = doc(db, category, product.uid);
    const unsubscribe = onSnapshot(productRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedProduct = docSnap.data();

        if (category === "Clothing" || category === "Shoes") {
          if (selectedSize) {
            setAvailableStock(updatedProduct.inventory[selectedSize] || 0);
          } else {
            setAvailableStock(0);
          }
        } else {
          setAvailableStock(updatedProduct.inventory || 0);
        }
        product.inventory = updatedProduct.inventory;
      }
    });
    return unsubscribe;
  };

  const checkIfFavorite = async () => {
    try {
      const docRef = doc(db, "userProfile", user.uid, "favorites", product.uid);
      const docSnap = await getDoc(docRef);

      setIsFavorite(docSnap.exists());
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = fetchProductData();
      checkIfFavorite();
      return unsubscribe;
    }
  }, [user, selectedSize]);

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
    setAvailableStock(product.inventory[size]);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!user) return;
    if ((category === "Clothing" || category === "Shoes") && !selectedSize) {
      return;
    }

    const cartItemId = `${product.uid}-${selectedSize || "default"}`;
    const cartRef = doc(db, "userProfile", user.uid, "cart", cartItemId);

    try {
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const existingQuantity = cartSnap.data().quantity;
        const newQuantity = existingQuantity + quantity;
        await updateDoc(cartRef, { quantity: newQuantity });
      } else {
        const productToAdd = {
          uid: product.uid,
          category: product.category,
          quantity: quantity,
          addedAt: serverTimestamp(),
        };

        if (category === "Clothing" || category === "Shoes") {
          productToAdd.size = selectedSize;
        }

        await setDoc(cartRef, productToAdd);
      }

      const inventoryRef = doc(db, category, product.uid);
      const newStock =
        category === "Clothing" || category === "Shoes"
          ? product.inventory[selectedSize] - quantity
          : product.inventory - quantity;

      await updateDoc(inventoryRef, {
        [category === "Clothing" || category === "Shoes"
          ? `inventory.${selectedSize}`
          : "inventory"]: newStock,
      });

      Alert.alert("Success", `${product.name} has been added to your cart.`);
      setSelectedSize(null);
      setQuantity(1);
      fetchProductData();
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const docRef = doc(db, "userProfile", user.uid, "favorites", product.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await deleteDoc(docRef);
        setIsFavorite(false);
      } else {
        await setDoc(docRef, {
          uid: product.uid,
          category: product.category,
          addedAt: serverTimestamp(),
        });
        setIsFavorite(true);
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

        {(category === "Jewelry" ||
          category === "BeautyPersonalCare" ||
          category === "HealthWellness") && (
          <Text style={styles.stockText}>
            Available Stock: {product.inventory}
          </Text>
        )}

        {(category === "Clothing" || category === "Shoes") && (
          <>
            <Text style={styles.sizes}>Available Sizes:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sizeConfigurations[category.toLowerCase()].order.map(
                (size, index) => {
                  const isAvailable = product.inventory[size] > 0;
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

        {(category !== "Clothing" && category !== "Shoes") || selectedSize ? (
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
              onPress={() =>
                setQuantity(Math.min(availableStock, quantity + 1))
              }
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
