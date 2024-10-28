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
import { db } from "../Configs/FirebaseConfig"; // Import Firestore db from firebase.js
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const Cart = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Get the current user
  const [cartItems, setCartItems] = useState([]); // State to hold cart items
  const [loading, setLoading] = useState(false); // Loading state for fetching cart
  const [isLoggedIn, setIsLoggedIn] = useState(true); // State to check if the user is logged in

  // Function to fetch cart items from Firestore
  const fetchCartItems = async () => {
    if (!user) {
      setIsLoggedIn(false); // Set login status to false if no user
      return;
    }

    setLoading(true); // Start loading when fetching
    try {
      const cartRef = collection(db, "userProfile", user.uid, "cart");
      const snapshot = await getDocs(cartRef);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCartItems(items); // Update the state with the fetched cart items
    } catch (error) {
      console.error("Error fetching cart items: ", error);
      Alert.alert("Error", "Failed to load cart items.");
    } finally {
      setLoading(false); // Stop loading once fetch is complete
    }
  };

  // Function to handle item removal
  const handleRemoveItem = async (itemId) => {
    try {
      const itemRef = doc(db, "userProfile", user.uid, "cart", itemId);
      await deleteDoc(itemRef); // Remove item from Firestore
      setCartItems(cartItems.filter((item) => item.id !== itemId)); // Remove item from local state
      Alert.alert("Item removed", "The item has been removed from your cart.");
    } catch (error) {
      console.error("Error removing item from cart: ", error);
      Alert.alert(
        "Error",
        "There was an issue removing the item from your cart."
      );
    }
  };

  // Function to handle quantity update
  const handleUpdateQuantity = async (itemId, action) => {
    const updatedItems = cartItems.map((item) => {
      if (item.id === itemId) {
        const newQuantity =
          action === "increase" ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // Prevent quantity from going below 1
      }
      return item;
    });

    setCartItems(updatedItems); // Update the local state for immediate UI change

    try {
      const itemRef = doc(db, "userProfile", user.uid, "cart", itemId);
      await updateDoc(itemRef, {
        quantity: updatedItems.find((item) => item.id === itemId).quantity,
      });
    } catch (error) {
      console.error("Error updating quantity: ", error);
      Alert.alert("Error", "Failed to update item quantity.");
    }
  };

  // Function to listen to real-time changes in Firestore
  const listenToCartUpdates = () => {
    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    const cartRef = collection(db, "userProfile", user.uid, "cart");
    return onSnapshot(cartRef, (snapshot) => {
      const updatedCartItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(updatedCartItems); // Update the state whenever Firestore changes
    });
  };

  // Fetch cart items on component mount and listen for real-time changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
      const unsubscribe = listenToCartUpdates(); // Start listening to changes
      return () => unsubscribe(); // Cleanup listener when component unmounts
    }
  }, [user]); // Re-fetch when user changes (log in or log out)

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
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {/* Display size only for clothing and shoes */}
                {item.category === "Clothing" || item.category === "Shoes" ? (
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                ) : null}
                <Text style={styles.itemPrice}>${item.price}</Text>

                {/* Quantity Controls */}
                <View style={styles.quantityControls}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, "decrease")}
                  >
                    <Text style={styles.quantityText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, "increase")}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </Pressable>
                </View>

                {/* Remove Button */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 8,
  },
  itemDetails: {
    marginLeft: 16,
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemSize: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    color: "#000",
    marginVertical: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  quantityButton: {
    backgroundColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: "#ff4d4d",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  removeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Cart;
