import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  SafeAreaView,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../Configs/FirebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { useStripe } from "@stripe/stripe-react-native";

const Cart = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const fetchProductDetails = async (productUid, category) => {
    if (!category || !productUid) {
      console.error("Category or product UID is missing.");
      return null;
    }

    const productRef = doc(db, category, productUid);
    try {
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        return productSnap.data();
      } else {
        console.warn(`No product found for UID: ${productUid}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching product details: ", error);
      return null;
    }
  };

  const fetchCartItems = async () => {
    if (!user) {
      setIsLoggedIn(false);
      return;
    }
    setLoading(true);

    try {
      const cartRef = collection(db, "userProfile", user.uid, "cart");
      const snapshot = await getDocs(cartRef);

      const items = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const item = doc.data();
          const productDetails = await fetchProductDetails(
            item.uid,
            item.category
          );

          if (productDetails) {
            const maxInventory = item.size
              ? productDetails.inventory[item.size] || 0
              : productDetails.inventory || 0;
            return {
              id: doc.id,
              ...item,
              ...productDetails,
              quantity: Math.min(item.quantity, maxInventory),
            };
          }
          return null;
        })
      );

      setCartItems(items.filter((item) => item !== null));
    } catch (error) {
      console.error("Error fetching cart items: ", error);
      Alert.alert("Error", "Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const itemRef = doc(db, "userProfile", user.uid, "cart", itemId);
      await deleteDoc(itemRef);
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      Alert.alert("Item removed", "The item has been removed from your cart.");
    } catch (error) {
      console.error("Error removing item from cart: ", error);
      Alert.alert(
        "Error",
        "There was an issue removing the item from your cart."
      );
    }
  };

  const handleUpdateQuantity = async (itemId, action) => {
    const currentItem = cartItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    let newQuantity = currentItem.quantity;
    const maxInventory = currentItem.size
      ? currentItem.inventory[currentItem.size] || 0
      : currentItem.inventory || 0;

    if (action === "increase") {
      newQuantity = Math.min(currentItem.quantity + 1, maxInventory);
    } else if (action === "decrease") {
      newQuantity = Math.max(currentItem.quantity - 1, 1);
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const itemRef = doc(db, "userProfile", user.uid, "cart", itemId);
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity: ", error);
      Alert.alert("Error", "Failed to update item quantity.");
    }
  };

  const listenToCartUpdates = () => {
    if (!user) return;

    const cartRef = collection(db, "userProfile", user.uid, "cart");
    return onSnapshot(cartRef, async (snapshot) => {
      const updatedCartItems = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const item = doc.data();
          const productDetails = await fetchProductDetails(
            item.uid,
            item.category
          );

          if (productDetails) {
            const maxInventory = item.size
              ? productDetails.inventory[item.size] || 0
              : productDetails.inventory || 0;
            return {
              id: doc.id,
              ...item,
              ...productDetails,
              quantity: Math.min(item.quantity, maxInventory),
            };
          }
          return null;
        })
      );

      setCartItems(updatedCartItems.filter((item) => item !== null));
    });
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();
      const unsubscribe = listenToCartUpdates();
      return () => unsubscribe();
    }
  }, [user]);

  const handleCheckout = async () => {
    try {
      // Fetch Payment Intent Client Secret from the backend
      const response = await fetch(
        "https://pi-quicart.vercel.app/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(calculateSubtotal() * 100), // Convert to cents
          }),
        }
      );

      if (!response.ok) {
        Alert.alert("Error", "Unable to initiate payment.");
        return;
      }

      const { clientSecret } = await response.json();
      if (!clientSecret) {
        Alert.alert("Error", "Unable to initiate payment.");
        return;
      }

      // Initialize Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Quicart Shopping App",
        returnURL: "quicart://payment-completed",
      });

      if (initError) {
        Alert.alert("Error", "Failed to initialize payment sheet.");
        return;
      }

      // Present the Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert("Error", presentError.message);
      } else {
        Alert.alert("Success", "Your order is confirmed!");

        // Generate order number and create order history
        const orderHistoryRef = collection(
          db,
          "userProfile",
          user.uid,
          "orderHistory"
        );
        const orderNumber = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit random order number

        // Save each cart item as an order record
        await Promise.all(
          cartItems.map(async (item) => {
            const sizeField =
              item.category === "Clothing" || item.category === "Shoes"
                ? item.size
                : "N/A";

            // Save order details to Firestore
            await addDoc(orderHistoryRef, {
              orderNumber,
              productUid: item.uid,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: sizeField,
              images: item.images || [],
              orderStatus: "Confirmed", // Initial order status
              timestamp: new Date(), // Order timestamp
            });

            // Decrease stock in Firestore
            const productRef = doc(db, item.category, item.uid);
            const inventoryKey =
              item.category === "Clothing" || item.category === "Shoes"
                ? `inventory.${item.size}`
                : "inventory";

            const currentProductSnap = await getDoc(productRef);
            if (currentProductSnap.exists()) {
              const currentInventory =
                currentProductSnap.get(inventoryKey) || 0;
              const updatedInventory = Math.max(
                0,
                currentInventory - item.quantity
              );

              // Update inventory in Firestore
              await updateDoc(productRef, {
                [inventoryKey]: updatedInventory,
              });
            }
          })
        );

        // Clear cart items after successful order placement
        const cartRef = collection(db, "userProfile", user.uid, "cart");
        await Promise.all(
          cartItems.map((item) => deleteDoc(doc(cartRef, item.id)))
        );

        setCartItems([]); // Clear cart state in the app
      }
    } catch (err) {
      console.error("Checkout error:", err);
      Alert.alert("Error", "Something went wrong during checkout.");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.text}>
            You are not logged in. Please sign in to view and manage your cart.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.text}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {cartItems.length === 0 ? (
          <View style={styles.centeredContent}>
            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image
                source={{
                  uri:
                    item.images && item.images.length > 0
                      ? item.images[0]
                      : null,
                }}
                style={styles.image}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.category === "Clothing" || item.category === "Shoes" ? (
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                ) : null}
                <Text style={styles.itemPrice}>${item.price}</Text>
                <View style={styles.quantityControls}>
                  <Pressable
                    style={[
                      styles.quantityButton,
                      item.quantity <= 1 && styles.disabledButton,
                    ]}
                    onPress={() => handleUpdateQuantity(item.id, "decrease")}
                    disabled={item.quantity <= 1}
                  >
                    <Text
                      style={[
                        styles.quantityText,
                        item.quantity === 1 && styles.disabledText,
                      ]}
                    >
                      -
                    </Text>
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable
                    style={[
                      styles.quantityButton,
                      item.quantity >=
                        (item.size
                          ? item.inventory[item.size]
                          : item.inventory) && styles.disabledButton,
                    ]}
                    onPress={() => handleUpdateQuantity(item.id, "increase")}
                    disabled={
                      item.quantity >=
                      (item.size ? item.inventory[item.size] : item.inventory)
                    }
                  >
                    <Text
                      style={[
                        styles.quantityText,
                        item.quantity >=
                          (item.size
                            ? item.inventory[item.size]
                            : item.inventory) && styles.disabledText,
                      ]}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {cartItems.length > 0 && (
        <View style={styles.subtotalContainer}>
          <Text style={styles.subtotalText}>
            Subtotal: ${calculateSubtotal().toFixed(2)}
          </Text>
          <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  emptyCartText: {
    fontSize: 20,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemSize: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    color: "#000",
    marginVertical: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  quantityButton: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: "#ff4d4f",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  removeText: {
    color: "white",
    fontSize: 16,
  },
  subtotalContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: "600",
  },
  checkoutButton: {
    marginTop: 16,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  disabledText: {
    color: "#aaa",
  },
});

export default Cart;
