import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  ImageBackground,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../Configs/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import sharedStyles from "./styles"; // Adjust the path as necessary

const HealthWellness = () => {
  const [category, setCategory] = useState("Medicine");
  const [productDetails, setProductDetails] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
  });
  const [inventory, setInventory] = useState({});

  const categories = [
    "Medicine",
    "Exercise Equipment",
    "Massaging Devices",
    "Supplements",
    "Yoga Accessories",
  ];

  const inventoryByCategory = {
    Medicine: ["Tablets", "Bottles", "Packs"],
    "Exercise Equipment": ["Sets", "Units"],
    "Massaging Devices": ["Units"],
    Supplements: ["Bottles", "Packs"],
    "Yoga Accessories": ["Mats", "Blocks", "Straps"],
  };

  const handleInputChange = (field, value) => {
    setProductDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleInventoryChange = (item, value) => {
    setInventory((prev) => ({ ...prev, [item]: value }));
  };

  const handleSubmit = async () => {
    const { productName, brand, price, description } = productDetails;

    if (
      !name ||
      !brand ||
      !Object.values(inventory).some((value) => value) ||
      !price ||
      !description
    ) {
      Alert.alert(
        "Error",
        "Please fill all fields and upload at least one image"
      );
      return;
    }

    try {
      const categoryPath = `HealthWellness`;
      const uid = `${category}_${Date.now()}`;

      await addDoc(collection(db, categoryPath), {
        uid,
        category,
        name,
        brand,
        inventory,
        price: parseFloat(price),
        description,
        images: [],
      });

      Alert.alert("Success", "Health & Wellness item added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Could not add item. Please try again.");
    }
  };

  const resetForm = () => {
    setProductDetails({
      productName: "",
      brand: "",
      price: "",
      description: "",
    });
    setInventory({});
  };

  return (
    <ImageBackground
      source={{
        uri: "https://i.pinimg.com/564x/a3/d6/14/a3d614b7a8a5c3f9082e33a1b236f8e2.jpg",
      }}
      style={sharedStyles.container} // Reuse sharedStyles for the container
    >
      <ScrollView contentContainerStyle={sharedStyles.container}>
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.title}>Add Health & Wellness Product</Text>

          <Text style={sharedStyles.label}>Select Product Category:</Text>
          <Picker
            selectedValue={category}
            mode="dropdown"
            style={sharedStyles.picker}
            onValueChange={(itemValue) => {
              setCategory(itemValue);
              const newInventory = {};
              inventoryByCategory[itemValue].forEach((item) => {
                newInventory[item] = ""; // Reset inventory values for new category
              });
              setInventory(newInventory);
            }}
          >
            {categories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>

          <TextInput
            style={sharedStyles.input}
            placeholder="Product Name"
            value={productDetails.productName}
            onChangeText={(value) => handleInputChange("productName", value)}
            placeholderTextColor="#888"
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="Brand"
            value={productDetails.brand}
            onChangeText={(value) => handleInputChange("brand", value)}
            placeholderTextColor="#888"
          />

          {inventoryByCategory[category].map((item) => (
            <TextInput
              key={item}
              style={sharedStyles.input}
              placeholder={`Inventory for ${item}`}
              keyboardType="numeric"
              value={inventory[item] ? inventory[item].toString() : ""}
              onChangeText={(value) => handleInventoryChange(item, value)}
              placeholderTextColor="#888"
            />
          ))}

          <TextInput
            style={sharedStyles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={productDetails.price}
            onChangeText={(value) => handleInputChange("price", value)}
            placeholderTextColor="#888"
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="Description"
            value={productDetails.description}
            onChangeText={(value) => handleInputChange("description", value)}
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

export default HealthWellness;
