import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, ImageBackground, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../Configs/FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const HealthWellness = () => {
  const [category, setCategory] = useState('Medicine');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [inventory, setInventory] = useState({});
  const [imageUris, setImageUris] = useState([]);

  const categories = ['Medicine', 'Exercise Equipment', 'Massaging Devices', 'Supplements', 'Yoga Accessories'];

  const inventoryByCategory = {
    Medicine: ['Tablets', 'Bottles', 'Packs'],
    'Exercise Equipment': ['Sets', 'Units'],
    'Massaging Devices': ['Units'],
    Supplements: ['Bottles', 'Packs'],
    'Yoga Accessories': ['Mats', 'Blocks', 'Straps'],
  };

  const handleSubmit = async () => {
    if (!productName || !brand || !Object.keys(inventory).length || !price || !description || !imageUris.length) {
      Alert.alert('Error', 'Please fill all fields and upload at least one image');
      return;
    }

    try {
      const categoryPath = `Product/HealthWellness/${category}`;
      const uid = `${category}_${Date.now()}`;

      await addDoc(collection(db, categoryPath), {
        uid,
        category,
        productName,
        brand,
        inventory,
        price: parseFloat(price),
        description,
        images: imageUris,
      });

      Alert.alert('Success', 'Health & Wellness item added successfully!');
      setProductName('');
      setBrand('');
      setInventory({});
      setPrice('');
      setDescription('');
      setImageUris([]);
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Could not add item. Please try again.');
    }
  };

  const handlePickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://i.pinimg.com/564x/a3/d6/14/a3d614b7a8a5c3f9082e33a1b236f8e2.jpg' }}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Health & Wellness Product</Text>

          <Text style={styles.label}>Select Product Category:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              {categories.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={productName}
            onChangeText={setProductName}
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor="#888"
          />

          {inventoryByCategory[category].map((item) => (
            <TextInput
              key={item}
              style={styles.input}
              placeholder={`Inventory for ${item}`}
              keyboardType="numeric"
              value={inventory[item] ? inventory[item].toString() : ''}
              onChangeText={(value) => setInventory({ ...inventory, [item]: value })}
              placeholderTextColor="#888"
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholderTextColor="#888"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#888"
            multiline={true}
            numberOfLines={4}
          />

          {/* Image Picker */}
          <Button title="Pick Images" onPress={handlePickImages} />

          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
    fontWeight: '500',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
    padding: 5,
  },
  input: {
    width: '100%',
    height: 50,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6AB7A8',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#6AB7A8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HealthWellness;
