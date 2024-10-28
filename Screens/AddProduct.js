import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  { name: "Clothing", screen: "Clothing", icon: "shirt-outline" },
  { name: "Shoes", screen: "Shoes", icon: "footsteps-outline" },
  {
    name: "Beauty & Personal Care",
    screen: "BeautyPersonalCare",
    icon: "flower-outline",
  },
  {
    name: "Health & Wellness",
    screen: "HealthWellness",
    icon: "fitness-outline",
  },
  { name: "Jewelry", screen: "Jewelry", icon: "diamond-outline" },
];

const AddProduct = ({ navigation }) => {
  const handleCategoryPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <LinearGradient colors={["#e0f7fa", "#ffffff"]} style={styles.container}>
      <Text style={styles.title}>Add Your Product</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable
              key={category.name}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? "#0097a7" : "#00bcd4" },
              ]}
              onPress={() => handleCategoryPress(category.screen)}
            >
              <Ionicons
                name={category.icon}
                size={32}
                color="#ffffff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#00796b",
    textAlign: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    width: "100%",
  },
  button: {
    width: "42%", // Adjust to allow buttons with some spacing
    height: 150,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6.0,
    elevation: 4,
  },
  buttonText: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
  icon: {
    marginBottom: 5,
  },
});

export default AddProduct;
