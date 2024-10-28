import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Button,
  Alert,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../Configs/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import sharedStyles from "./styles"; // Adjust the path as necessary

const Jewelry = () => {
  const [jewelryCategory, setJewelryCategory] = useState("Necklace");
  const [jewelryName, setJewelryName] = useState("");
  const [material, setMaterial] = useState("Gold");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [inventory, setInventory] = useState("");

  const jewelryCategories = [
    "Necklace",
    "Bracelet",
    "Earrings",
    "Ring",
    "Pendant",
    "Bangle",
  ];
  const materials = ["Gold", "Silver", "Diamond", "Platinum", "Pearl"];

  const handleSubmit = async () => {
    if (!jewelryName || !weight || !price || !description || !inventory) {
      // Updated check
      Alert.alert(
        "Error",
        "Please fill all fields and upload at least one image"
      );
      return;
    }

    try {
      const categoryPath = `Jewelry`;
      const uid = `${jewelryCategory}_${Date.now()}`;

      await addDoc(collection(db, categoryPath), {
        uid,
        jewelryCategory,
        jewelryName,
        material,
        weight: parseFloat(weight),
        price: parseFloat(price),
        description,
        images: [],
        inventory: parseInt(inventory),
      });

      Alert.alert("Success", "Jewelry item added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Could not add item. Please try again.");
    }
  };

  const resetForm = () => {
    setJewelryName("");
    setWeight("");
    setPrice("");
    setDescription("");
    setInventory("");
  };

  return (
    <ImageBackground
      source={{
        uri: "https://i.pinimg.com/564x/e8/c8/ef/e8c8ef9d9e9f8c292ad1c0c7de254f55.jpg",
      }}
      style={sharedStyles.background}
    >
      <ScrollView contentContainerStyle={sharedStyles.container}>
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.title}>Add Jewelry Details</Text>

          <Text style={sharedStyles.label}>Select Jewelry Type:</Text>
          <View style={sharedStyles.pickerContainer}>
            <Picker
              selectedValue={jewelryCategory}
              style={sharedStyles.picker}
              onValueChange={(itemValue) => setJewelryCategory(itemValue)}
            >
              {jewelryCategories.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={sharedStyles.input}
            placeholder="Jewelry Name"
            value={jewelryName}
            onChangeText={setJewelryName}
            placeholderTextColor="#888"
          />

          <Text style={sharedStyles.label}>Select Material:</Text>
          <View style={sharedStyles.pickerContainer}>
            <Picker
              selectedValue={material}
              style={sharedStyles.picker}
              onValueChange={(itemValue) => setMaterial(itemValue)}
            >
              {materials.map((material) => (
                <Picker.Item key={material} label={material} value={material} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={sharedStyles.input}
            placeholder="Weight (in grams)"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholderTextColor="#888"
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholderTextColor="#888"
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="Number of Items" // This can be updated to "Inventory"
            keyboardType="numeric"
            value={inventory} // Updated to inventory
            onChangeText={setInventory} // Updated to setInventory
            placeholderTextColor="#888"
          />

          <TextInput
            style={[sharedStyles.input, sharedStyles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#888"
            multiline={true}
            numberOfLines={4}
          />

          <Button title="Add Product" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Jewelry;
