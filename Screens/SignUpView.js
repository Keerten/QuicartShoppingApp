import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { auth } from "../Configs/FirebaseConfig"; // Import auth from FirebaseConfig
import { db } from "../Configs/FirebaseConfig"; // Import db from FirebaseConfig
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

const SignUpView = ({ navigation }) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New state for storing user's name

  // Function to create a new user on Firebase Auth and save to Firestore
  const onCreateAccountPressed = async () => {
    console.log("Creating account...");
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        emailAddress,
        password
      );
      const user = userCredentials.user;

      console.log("Account Created Successfully for User:", user.uid);

      // Create a user profile in Firestore
      await setDoc(doc(db, "userProfile", user.uid), {
        name: name,
        email: user.email,
        uid: user.uid,
      });

      console.log(
        "User profile created successfully in Firestore for UID:",
        user.uid
      );
      Alert.alert("Success", "Account created successfully!");

      // Navigate to SignIn screen after account creation
      navigation.navigate("SignIn");
    } catch (err) {
      console.log(`Error while creating account: ${err}`);
      Alert.alert("Error", `${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Account</Text>
      <TextInput
        style={styles.inputStyle}
        placeholder="Enter Your Name"
        textContentType="name"
        autoCapitalize="words"
        returnKeyType="next"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder="Enter Email Address"
        textContentType="emailAddress"
        autoCapitalize="none"
        returnKeyType="next"
        value={emailAddress}
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder="Enter Password"
        textContentType="password"
        autoCapitalize="none"
        returnKeyType="done"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.buttonStyle} onPress={onCreateAccountPressed}>
        <Text style={styles.buttonTextStyle}>Create Account</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputStyle: {
    width: "100%",
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 18,
  },
  buttonStyle: {
    width: "100%",
    height: 50,
    marginVertical: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonTextStyle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 20,
  },
});

export default SignUpView;
