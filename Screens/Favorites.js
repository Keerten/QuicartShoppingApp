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
import { collection, onSnapshot } from "firebase/firestore";

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
        (snapshot) => {
          const favoritesData = snapshot.docs.map((doc) => ({
            ...doc.data(),
          }));
          setFavorites(favoritesData);
          setLoading(false); // Data loaded
        },
        (error) => {
          console.error("Error fetching favorites: ", error);
          setError("Failed to load favorites. Please try again.");
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      setLoading(false); // If no user, stop loading
    }
  }, [user]);

  const handleFavoritePress = (item) => {
    navigation.navigate("ProductDetails", { product: item });
  };

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
    <SafeAreaView style={styles.container}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
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
