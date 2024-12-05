import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { auth, db } from "../Configs/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUpView = ({ navigation }) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const onCreateAccountPressed = async () => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        emailAddress,
        password
      );
      const user = userCredentials.user;

      console.log("Account Created Successfully for User:", user.uid);

      await setDoc(doc(db, "userProfile", user.uid), {
        name: name,
        email: user.email,
        uid: user.uid,
        phoneNumber: phoneNumber,
        address: {
          street,
          apt,
          city,
          postalCode,
          country,
        },
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("SignIn");
    } catch (err) {
      console.log(`Error while creating account: ${err}`);
      Alert.alert("Error", `${err.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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

            {/* Address Fields */}
            <TextInput
              style={styles.inputStyle}
              placeholder="Street Address"
              value={street}
              onChangeText={setStreet}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Apartment (Optional)"
              value={apt}
              onChangeText={setApt}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <Pressable
              style={styles.buttonStyle}
              onPress={onCreateAccountPressed}
            >
              <Text style={styles.buttonTextStyle}>Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 20,
    width: "100%",
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
