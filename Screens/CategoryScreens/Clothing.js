import React, { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { db } from "../../Configs/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import sharedStyles from "./styles"; // Adjust path as necessary

const Clothing = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("Men");
  const [clothingCategory, setClothingCategory] = useState("Shirt");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState({ S: "", M: "", L: "", XL: "" });
  const [loading, setLoading] = useState(false);

  const clothingCategories = {
    Men: ["Shirt", "Pants", "Jeans", "Shorts", "Jacket", "Suit"],
    Women: ["Dress", "Skirt", "Blouse", "Pants", "Leggings", "Top"],
    Kids: ["T-Shirt", "Shorts", "Dress", "Pants", "Jacket", "Sweater"],
  };

  const handleSubmit = async () => {
    console.log("Submit button pressed");

    if (!name || !description || !price) {
      Alert.alert("Error", "Please fill all fields");
      console.log("Validation error: All fields must be filled");
      return;
    }

    const inventoryValues = Object.values(inventory);
    if (inventoryValues.some((value) => isNaN(value) || parseInt(value) < 0)) {
      Alert.alert("Error", "Inventory values must be non-negative numbers");
      console.log("Validation error: Inventory values must be non-negative");
      return;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
      Alert.alert("Error", "Price must be a non-negative number");
      console.log("Validation error: Price must be a non-negative number");
      return;
    }

    setLoading(true); // Show loading state
    console.log("Preparing to add document to Firestore");

    try {
      const categoryPath = `Clothing`; // Only use "Products" for the collection path
      console.log("Category Path:", categoryPath);

      const productData = {
        name,
        description,
        category: "Clothing",
        subCategory: clothingCategory,
        gender,
        price: parseFloat(price),
        images: [],
        inventory: {
          S: parseInt(inventory.S),
          M: parseInt(inventory.M),
          L: parseInt(inventory.L),
          XL: parseInt(inventory.XL),
        },
        uid: `${gender}_${clothingCategory}_${Date.now()}`,
      };

      console.log("Product Data:", productData);

      await addDoc(collection(db, categoryPath), productData); // Add document to the collection
      console.log("Document successfully added!");

      Alert.alert("Success", "Clothing item added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Could not add item. Please try again.");
    } finally {
      setLoading(false); // Hide loading state
      console.log("Loading state reset");
    }
  };

  const resetForm = () => {
    console.log("Resetting form");
    setName("");
    setDescription("");
    setPrice("");
    setInventory({ S: "", M: "", L: "", XL: "" });
    setGender("Men");
    setClothingCategory("Shirt");
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Text style={sharedStyles.title}>Add Clothing Product</Text>
      <TextInput
        style={sharedStyles.input}
        onChangeText={setName}
        value={name}
        placeholder="Product Name"
      />
      <TextInput
        style={sharedStyles.input}
        onChangeText={setDescription}
        value={description}
        placeholder="Product Description"
        multiline
      />
      <Text style={sharedStyles.label}>Gender :</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => {
          setGender(itemValue);
          setClothingCategory(clothingCategories[itemValue][0]);
        }}
      >
        {Object.keys(clothingCategories).map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>
      <Text style={sharedStyles.label}>Clothing Category:</Text>
      <Picker
        selectedValue={clothingCategory}
        onValueChange={(itemValue) => {
          setClothingCategory(itemValue);
          console.log("Clothing Category selected:", itemValue);
        }}
      >
        {clothingCategories[gender].map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>
      <TextInput
        style={sharedStyles.input}
        onChangeText={setPrice}
        value={price}
        placeholder="Price"
        keyboardType="numeric"
      />
      {["S", "M", "L", "XL"].map((size) => (
        <TextInput
          key={size}
          style={sharedStyles.input}
          onChangeText={(value) => {
            setInventory((prev) => ({ ...prev, [size]: value }));
          }}
          value={inventory[size]}
          placeholder={`Stock for size ${size}`}
          keyboardType="numeric"
        />
      ))}
      <Button
        title={loading ? "Adding..." : "Add Product"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
});

export default Clothing;
