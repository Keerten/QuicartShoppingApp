import React, { useState } from "react";
import { Text, TextInput, Alert, ScrollView, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../Configs/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import sharedStyles from "./styles"; // Adjust path as necessary

const BeautyPersonalCare = () => {
  const [category, setCategory] = useState("Makeup");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [inventory, setInventory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const categories = [
    "Makeup",
    "Nails",
    "Brushes",
    "Skincare",
    "Haircare",
    "Fragrance",
  ];

  const handleSubmit = async () => {
    if (!name || !brand || !inventory || !price || !description) {
      Alert.alert(
        "Error",
        "Please fill all fields and upload at least one image"
      );
      return;
    }

    try {
      const categoryPath = `BeautyPersonalCare`;
      const uid = `${category}_${Date.now()}`;

      const productData = {
        name,
        brand,
        description,
        images: [],
        inventory: parseInt(inventory),
        price: parseFloat(price),
        category,
        uid,
      };

      await addDoc(collection(db, categoryPath), productData);
      Alert.alert("Success", "Beauty product added successfully!");
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Could not add item. Please try again.");
    }
  };

  const resetForm = () => {
    setCategory("Makeup");
    setName("");
    setBrand("");
    setInventory("");
    setPrice("");
    setDescription("");
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Text style={sharedStyles.title}>Add Beauty Product</Text>
      <Picker selectedValue={category} onValueChange={setCategory}>
        {categories.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>
      <TextInput
        style={sharedStyles.input}
        onChangeText={setName}
        value={name}
        placeholder="Product Name"
      />
      <TextInput
        style={sharedStyles.input}
        onChangeText={setBrand}
        value={brand}
        placeholder="Brand"
      />
      <TextInput
        style={sharedStyles.input}
        onChangeText={setInventory}
        value={inventory}
        placeholder="Inventory"
        keyboardType="numeric"
      />
      <TextInput
        style={sharedStyles.input}
        onChangeText={setPrice}
        value={price}
        placeholder="Price"
        keyboardType="numeric"
      />
      <TextInput
        style={[sharedStyles.input, sharedStyles.textArea]}
        onChangeText={setDescription}
        value={description}
        placeholder="Description"
        multiline
      />
      <Button title="Add Product" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default BeautyPersonalCare;
