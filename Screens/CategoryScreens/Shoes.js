import React, { useState } from "react";
import { Text, TextInput, Button, ScrollView, Alert } from "react-native";
import { db } from "../../Configs/FirebaseConfig"; // Adjust the path as necessary
import { collection, addDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import sharedStyles from "./styles"; // Adjust the path as necessary

const Shoes = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("Men"); // Default gender
  const [shoeCategory, setShoeCategory] = useState("Sneakers"); // Default shoe category
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState({
    7: "",
    8: "",
    9: "",
    10: "",
  });
  const [loading, setLoading] = useState(false);

  const shoeCategories = {
    Men: ["Sneakers", "Boots", "Loafers", "Sandals"],
    Women: ["Flats", "Heels", "Sneakers", "Boots"],
    Kids: ["Sneakers", "Sandals", "Slippers"],
  };

  const handleSubmit = async () => {
    if (!name || !description || !price) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const inventoryValues = Object.values(inventory);
    if (inventoryValues.some((value) => isNaN(value) || parseInt(value) < 0)) {
      Alert.alert("Error", "Inventory values must be non-negative numbers");
      return;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
      Alert.alert("Error", "Price must be a non-negative number");
      return;
    }

    setLoading(true); // Show loading state

    try {
      const categoryPath = `Shoes`; // Collection path

      const productData = {
        name,
        description,
        category: "Shoes",
        subCategory: shoeCategory,
        gender: gender,
        price: parseFloat(price),
        images: [], // Assuming you will add images separately
        inventory: {
          7: parseInt(inventory[7]) || 0,
          8: parseInt(inventory[8]) || 0,
          9: parseInt(inventory[9]) || 0,
          10: parseInt(inventory[10]) || 0,
        },
      };

      await addDoc(collection(db, categoryPath), productData); // Add document to the collection
      Alert.alert("Success", "Shoe item added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Could not add item. Please try again.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setInventory({ 7: "", 8: "", 9: "", 10: "" });
    setGender("Men"); // Reset to default category
    setShoeCategory("Sneakers"); // Reset to default category
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Text style={sharedStyles.title}>Add Shoe Product</Text>

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
          setShoeCategory(shoeCategories[itemValue][0]); // Set default shoe category when main category changes
        }}
      >
        {Object.keys(shoeCategories).map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>

      <Text style={sharedStyles.label}>Shoe Category:</Text>
      <Picker selectedValue={shoeCategory} onValueChange={setShoeCategory}>
        {shoeCategories[gender].map((category) => (
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

      {/* Inventory Inputs */}
      {[7, 8, 9, 10].map((size) => (
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

export default Shoes;
