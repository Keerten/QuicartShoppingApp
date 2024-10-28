import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../Configs/FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

const Favorites = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const favoritesRef = collection(db, "userProfile", user.uid, "favorites");

      // Listen for real-time updates
      const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
        const favoritesData = snapshot.docs.map((doc) => ({
          ...doc.data(), // Spread all product data fields
        }));
        setFavorites(favoritesData);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const handleFavoritePress = (item) => {
    // Navigate to the product details screen
    navigation.navigate("ProductDetails", { product: item });
  };

  // Render each item in the favorites list
  const renderItem = ({ item }) => (
    <Pressable
      style={styles.favoriteItem}
      onPress={() => handleFavoritePress(item)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoritePrice}>${item.price}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          // Instead of using `id`, use a unique combination of product fields
          keyExtractor={(item) => `${item.name}-${item.price}`}
          contentContainerStyle={styles.favoritesList}
        />
      ) : (
        <Text style={styles.emptyMessage}>No favorites yet!</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  favoritesList: {
    paddingBottom: 20,
  },
  favoriteItem: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    ...(Platform.OS === "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
    }),
    ...(Platform.OS === "android" && {
      elevation: 3,
      shadowColor: "#f2f2f2",
    }),
  },
  favoriteImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  favoriteInfo: {
    justifyContent: "center",
    flex: 1, // Allow this view to take up available space
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexWrap: "wrap", // Allow text to wrap to the next line
    maxHeight: 50, // Limit the height of the text
  },
  favoritePrice: {
    fontSize: 16,
    color: "#888",
  },
  emptyMessage: {
    fontSize: 20,
    textAlign: "center",
    color: "#666",
  },
});

export default Favorites;
