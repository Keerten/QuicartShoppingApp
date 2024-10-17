import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../Configs/FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const Clothing = () => {
  const [mainCategory, setMainCategory] = useState('Men');
  const [clothingCategory, setClothingCategory] = useState('Shirt');
  const [clothingName, setClothingName] = useState('');
  const [inventory, setInventory] = useState({ S: '', M: '', L: '', XL: '', XXL: '' });
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const clothingCategories = {
    Men: ['Shirt', 'Pants', 'Jeans', 'Shorts', 'Jacket', 'Suit'],
    Women: ['Dress', 'Skirt', 'Blouse', 'Pants', 'Leggings', 'Top'],
    Kids: ['T-Shirt', 'Shorts', 'Dress', 'Pants', 'Jacket', 'Sweater'],
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleSubmit = async () => {
    if (!clothingName || !inventory.S || !inventory.M || !inventory.L || !inventory.XL || !inventory.XXL || !price || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const categoryPath = `Product/Clothing/${mainCategory}`;
      const uid = `${mainCategory}_${clothingCategory}_${Date.now()}`;

      await addDoc(collection(db, categoryPath), {
        uid,
        clothingCategory,
        clothingName,
        sizes: inventory,
        price: parseFloat(price),
        description,
      });

      Alert.alert('Success', 'Clothing item added successfully!');
      setClothingName('');
      setInventory({ S: '', M: '', L: '', XL: '', XXL: '' });
      setPrice('');
      setDescription('');
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Could not add item. Please try again.');
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://i.pinimg.com/564x/e8/c8/ef/e8c8ef9d9e9f8c292ad1c0c7de254f55.jpg' }} 
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Clothing Details</Text>

          <Text style={styles.label}>Select Main Category:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mainCategory}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setMainCategory(itemValue);
                setClothingCategory(clothingCategories[itemValue][0]);
              }}
            >
              <Picker.Item label="Men" value="Men" />
              <Picker.Item label="Women" value="Women" />
              <Picker.Item label="Kids" value="Kids" />
            </Picker>
          </View>

          <Text style={styles.label}>Select Clothing Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={clothingCategory}
              style={styles.picker}
              onValueChange={(itemValue) => setClothingCategory(itemValue)}
            >
              {clothingCategories[mainCategory].map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Clothing Name"
            value={clothingName}
            onChangeText={setClothingName}
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

          {sizes.map((size) => (
            <TextInput
              key={size}
              style={styles.input}
              placeholder={`Inventory for ${size}`}
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

export default Clothing;
