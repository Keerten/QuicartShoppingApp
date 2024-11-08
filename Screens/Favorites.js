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
  ActivityIndicator,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../Configs/FirebaseConfig";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";

const Favorites = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const favoritesRef = collection(db, "userProfile", user.uid, "favorites");

      // Listen for real-time updates
      const unsubscribe = onSnapshot(
        favoritesRef,
        async (snapshot) => {
          const favoritesData = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
              const item = docSnapshot.data();

              // Log category and uid for debugging
              console.log("Favorite item:", {
                category: item.category,
                uid: item.uid,
              });

              // Check if category and uid exist
              if (!item.category || !item.uid) {
                console.warn(
                  `Missing category or uid for favorite item: ${docSnapshot.id}`
                );
                return null;
              }

              try {
                // Get a reference to the product document based on category and uid
                const productRef = doc(db, item.category, item.uid);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                  return { id: docSnapshot.id, ...item, ...productSnap.data() };
                } else {
                  console.warn(`Product not found for UID: ${item.uid}`);
                  return null;
                }
              } catch (fetchError) {
                console.error("Error fetching product details:", fetchError);
                return null;
              }
            })
          );

          // Filter out any null items in case some products weren't found
          setFavorites(favoritesData.filter((item) => item !== null));
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching favorites: ", error);
          setError("Failed to load favorites. Please try again.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false); // If no user, stop loading
    }
  }, [user]);

  const handleFavoritePress = (item) => {
    // Log category and uid when navigating to ProductDetails
    console.log("Opening ProductDetails for:", {
      category: item.category,
      uid: item.uid,
    });
    navigation.navigate("ProductDetails", { product: item });
  };

  const handleRemoveFavorite = async (item) => {
    try {
      const favoriteRef = doc(
        db,
        "userProfile",
        user.uid,
        "favorites",
        item.id
      );
      await deleteDoc(favoriteRef);
      console.log(`Removed ${item.name} from favorites`);
    } catch (error) {
      console.error("Error removing favorite: ", error);
      setError("Failed to remove favorite. Please try again.");
    }
  };

  const renderRightActions = (item) => (
    <Pressable
      onPress={() => handleRemoveFavorite(item)}
      style={styles.removeIconWrapper}
    >
      <Ionicons name="trash-outline" size={24} color="red" />
    </Pressable>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
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
    </Swipeable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorMessage}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={styles.favoritesList}
        />
      ) : (
        <Text style={styles.emptyMessage}>No favorites yet!</Text>
      )}
    </GestureHandlerRootView>
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
    alignItems: "center",
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
    flex: 1,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexWrap: "wrap",
    maxHeight: 50,
  },
  favoritePrice: {
    fontSize: 16,
    color: "#888",
  },
  removeIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyMessage: {
    fontSize: 20,
    textAlign: "center",
    color: "#666",
  },
  errorMessage: {
    fontSize: 20,
    textAlign: "center",
    color: "red",
  },
});

export default Favorites;
