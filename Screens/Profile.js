import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../Configs/FirebaseConfig"; // Adjust according to your Firebase config
const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imageUri, setImageUri] = useState(null); // For storing image URI
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({
    apt: "",
    street: "",
    city: "",
    country: "",
    postalCode: "",
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    const userProfileRef = doc(db, "userProfile", userId);

    const unsubscribe = onSnapshot(userProfileRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setProfileData(userData);
        setName(userData.name || "");
        setEmail(userData.email || "");
        setPhoneNumber(userData.phoneNumber || "");
        setAddress(userData.address || {});
        setImageUri(userData.profilePhoto || null); // Set the profile photo if available
      } else {
        console.error("No user profile found for the given ID.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImagePick = async () => {
    console.log("Requesting media library permissions...");

    // Request permission to access the media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Access to the media library is required!"
      );
      return;
    }

    console.log("Permission granted, launching image picker...");

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Ensure no cropping/editing
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      console.log("User canceled or no valid URI returned.");
      return;
    }

    const selectedImageUri = result.assets[0].uri; // Use the cache URI directly
    console.log("Selected image URI:", selectedImageUri);

    try {
      // Fetch the file as a Blob
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();

      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert(
          "Error",
          "You must be signed in to upload a profile photo."
        );
        return;
      }

      // Extract file extension and create storage reference
      const fileExtension = selectedImageUri.split(".").pop();
      const fileName = `${userId}.${fileExtension}`;
      const storageRef = ref(storage, `profile_photos/${fileName}`);

      console.log("Uploading Blob to Firebase Storage...");

      // Upload the Blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);

      // Update Firestore with the download URL
      await updateDoc(doc(db, "userProfile", userId), {
        profilePhoto: downloadURL,
      });

      Alert.alert("Success", "Profile photo uploaded successfully.");
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      Alert.alert("Error", "Failed to upload the image. Please try again.");
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not authenticated.");
        return;
      }

      const userProfileRef = doc(db, "userProfile", userId);

      await updateDoc(userProfileRef, {
        name,
        phoneNumber,
        address,
      });

      setProfileData((prev) => ({
        ...prev,
        name,
        phoneNumber,
        address,
      }));

      Alert.alert("Success", "Profile updated successfully.");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }, [name, phoneNumber, address]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.headerText}>
            {editMode ? "Edit Your Profile" : "About Me"}
          </Text>

          <View style={styles.profileImageContainer}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : { uri: "https://via.placeholder.com/120" }
              }
              style={styles.profileImage}
            />
            <Button
              title="Change Photo"
              onPress={handleImagePick}
              color="#4CAF50"
            />
          </View>

          {editMode ? (
            <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                placeholder="Your email address"
                editable={false}
              />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                value={address.apt}
                onChangeText={(apt) => setAddress({ ...address, apt })}
                placeholder="Apartment (optional)"
              />
              <TextInput
                style={styles.input}
                value={address.street}
                onChangeText={(street) => setAddress({ ...address, street })}
                placeholder="Street"
              />
              <TextInput
                style={styles.input}
                value={address.city}
                onChangeText={(city) => setAddress({ ...address, city })}
                placeholder="City"
              />
              <TextInput
                style={styles.input}
                value={address.country}
                onChangeText={(country) => setAddress({ ...address, country })}
                placeholder="Country"
              />
              <TextInput
                style={styles.input}
                value={address.postalCode}
                onChangeText={(postalCode) =>
                  setAddress({ ...address, postalCode })
                }
                placeholder="Postal Code"
              />
              <View style={styles.buttonContainer}>
                {saving ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <>
                    <View style={styles.buttonWrapper}>
                      <Button
                        title="Save"
                        onPress={handleSave}
                        color="#4CAF50"
                      />
                    </View>
                    <View style={styles.buttonWrapper}>
                      <Button
                        title="Cancel"
                        onPress={() => setEditMode(false)}
                        color="#F44336"
                      />
                    </View>
                  </>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.fieldValue}>{profileData.name}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.fieldValue}>{profileData.email}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.fieldValue}>{profileData.phoneNumber}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.fieldValue}>
                  {profileData.address?.street
                    ? profileData.address.street + ", "
                    : ""}
                  {profileData.address?.city
                    ? profileData.address.city + ", "
                    : ""}
                  {profileData.address?.country
                    ? profileData.address.country + " "
                    : ""}
                  {profileData.address?.postalCode || ""}
                </Text>
              </View>
              <Button title="Edit Profile" onPress={() => setEditMode(true)} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 20,
    textAlign: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonWrapper: {
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
  fieldValue: {
    fontSize: 16,
    color: "#555",
  },
});

export default Profile;
