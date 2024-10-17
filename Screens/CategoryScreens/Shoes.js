import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, ImageBackground, Button, KeyboardAvoidingView, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // Alternative dropdown
import { db } from '../../Configs/FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const Shoes = () => {
  const [mainCategory, setMainCategory] = useState('Men');
  const [shoeCategory, setShoeCategory] = useState('Sneakers');
  const [shoeName, setShoeName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [inventory, setInventory] = useState({});
  const [imageUris, setImageUris] = useState([]);
  const [openMainCategory, setOpenMainCategory] = useState(false);
  const [openShoeCategory, setOpenShoeCategory] = useState(false);

  const shoeCategories = {
    Men: ['Sneakers', 'Boots', 'Loafers', 'Sandals'],
    Women: ['Flats', 'Heels', 'Sneakers', 'Boots'],
    Kids: ['Sneakers', 'Sandals', 'Slippers'],
  };

  const sizesByCategory = {
    Men: [7, 8, 9, 10, 11, 12],
    Women: [5, 6, 7, 8, 9, 10],
    Kids: [1, 2, 3, 4, 5, 6],
  };

  const handleSubmit = async () => {
    if (!shoeName || !Object.keys(inventory).length || !price || !description || !imageUris.length) {
      Alert.alert('Error', 'Please fill all fields and upload images');
      return;
    }

    try {
      const categoryPath = `Product/Shoes/${mainCategory}`;
      const uid = `${mainCategory}_${shoeCategory}_${Date.now()}`;

      await addDoc(collection(db, categoryPath), {
        uid,
        shoeCategory,
        shoeName,
        sizes: inventory,
        price: parseFloat(price),
        description,
        images: imageUris,
      });

      Alert.alert('Success', 'Shoe item added successfully!');
      setShoeName('');
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
      source={{ uri: 'https://i.pinimg.com/564x/e8/c8/ef/e8c8ef9d9e9f8c292ad1c0c7de254f55.jpg' }} 
      style={styles.background}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Add Shoe Details</Text>

            {/* Dropdown for Main Category */}
            <Text style={styles.label}>Select Main Category:</Text>
            <DropDownPicker
              open={openMainCategory}
              value={mainCategory}
              items={[
                { label: 'Men', value: 'Men' },
                { label: 'Women', value: 'Women' },
                { label: 'Kids', value: 'Kids' },
              ]}
              setOpen={setOpenMainCategory}
              setValue={setMainCategory}
              style={styles.picker}
              zIndex={5000}
            />

            <Text style={styles.label}>Select Shoe Type:</Text>
            <DropDownPicker
              open={openShoeCategory}
              value={shoeCategory}
              items={shoeCategories[mainCategory].map((category) => ({ label: category, value: category }))}
              setOpen={setOpenShoeCategory}
              setValue={setShoeCategory}
              style={styles.picker}
              zIndex={4000}
            />

            <TextInput
              style={styles.input}
              placeholder="Shoe Name"
              value={shoeName}
              onChangeText={setShoeName}
              placeholderTextColor="#888"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#888"
            />

            {sizesByCategory[mainCategory].map((size) => (
              <TextInput
                key={size}
                style={styles.input}
                placeholder={`Inventory for size ${size}`}
                keyboardType="numeric"
                value={inventory[size]}
                onChangeText={(value) => setInventory({ ...inventory, [size]: value })}
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

            {/* Image Picker */}
            <Button title="Pick Images" onPress={handlePickImages} />

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
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

export default Shoes;
