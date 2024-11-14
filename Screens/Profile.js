import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../Configs/FirebaseConfig";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // State variables for profile fields
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

    // Real-time listener to sync profile data
    const unsubscribe = onSnapshot(userProfileRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setProfileData(userData);
        setName(userData.name || "");
        setEmail(userData.email || "");
        setPhoneNumber(userData.phoneNumber || "");
        setAddress(userData.address || {});
      } else {
        console.error("No user profile found for the given ID.");
      }
      setLoading(false);
    });

    // Clean up listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not authenticated.");
        return;
      }

      const userProfileRef = doc(db, "userProfile", userId);

      // Update user profile in Firestore
      await updateDoc(userProfileRef, {
        name,
        phoneNumber,
        address,
      });

      // Update local state with new profile data
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
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No profile data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {editMode ? (
        <>
          <Text style={styles.profileText}>Edit Profile</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            placeholder="Enter your email"
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
                <Button title="Save" onPress={handleSave} />
                <Button
                  title="Cancel"
                  onPress={() => setEditMode(false)}
                  color="red"
                />
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
              {profileData.address?.city ? profileData.address.city + ", " : ""}
              {profileData.address?.country
                ? profileData.address.country + " "
                : ""}
              {profileData.address?.postalCode || ""}
            </Text>
          </View>
          <Button title="Edit Profile" onPress={() => setEditMode(true)} />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  label: {
    fontSize: 16,
    color: "#888",
  },
  fieldValue: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  disabledInput: {
    backgroundColor: "#e0e0e0",
    color: "#a0a0a0",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
  profileText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default Profile;
