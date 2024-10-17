import React, { useEffect, useState } from "react";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../Configs/FirebaseConfig";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false); // Track if we are in edit mode
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get the current user's ID
        console.log("Authenticated user ID:", userId);

        if (!userId) {
          console.error("User not authenticated.");
          return;
        }

        // Reference to the user's profile document in Firestore
        const userProfileRef = doc(db, "userProfile", userId);
        console.log(
          "Fetching user profile from Firestore:",
          userProfileRef.path
        );

        const userProfileSnapshot = await getDoc(userProfileRef);

        if (userProfileSnapshot.exists()) {
          const userData = userProfileSnapshot.data();
          console.log("User profile data fetched:", userData);
          setProfileData(userData); // Set the profile data
          setName(userData.name); // Initialize form fields with current data
          setEmail(userData.email);
        } else {
          console.error("No user profile found for the given ID.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
        console.log("Finished fetching user profile.");
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not authenticated.");
        return;
      }

      const userProfileRef = doc(db, "userProfile", userId);

      // Update only the name in Firestore
      await updateDoc(userProfileRef, {
        name: name,
      });

      // Update local state with new profile data
      setProfileData((prev) => ({
        ...prev,
        name: name,
      }));

      Alert.alert("Success", "Profile updated successfully.");
      setEditMode(false); // Exit edit mode after saving
    } catch (error) {
      console.error("Error updating user profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  if (loading) {
    console.log("Loading user profile data...");
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!profileData) {
    console.log("No profile data available...");
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
            editable={false} // Disable email input in edit mode
            placeholder="Email (cannot be changed)"
            keyboardType="email-address"
          />
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={handleSave} />
            <Button
              title="Cancel"
              onPress={() => setEditMode(false)}
              color="red"
            />
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
    padding: 20,
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
    backgroundColor: "#e0e0e0", // Greyed-out background to indicate disabled field
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
