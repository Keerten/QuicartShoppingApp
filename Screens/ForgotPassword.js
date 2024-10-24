import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { auth } from "../Configs/FirebaseConfig"; // Assuming Firebase is configured
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  // Method to send password reset email
  const onSendPasswordResetEmail = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Reset Email Sent",
        `A password reset link has been sent to ${email}. Please check your inbox to reset your password.`
      );
      navigation.navigate("SignIn"); // Navigate back to SignIn after sending the email
    } catch (error) {
      handlePasswordResetError(error);
    }
  };

  const handlePasswordResetError = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        Alert.alert(
          "User Not Found",
          "No account found with the provided email address."
        );
        break;
      case "auth/invalid-email":
        Alert.alert("Invalid Email", "The email address format is incorrect.");
        break;
      default:
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again later."
        );
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        style={styles.inputStyle}
        placeholder="Enter your email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Pressable style={styles.buttonStyle} onPress={onSendPasswordResetEmail}>
        <Text style={styles.buttonTextStyle}>Send Email</Text>
      </Pressable>
    </View>
  );
};

export default ForgotPasswordScreen;

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
    backgroundColor: "#007bff",
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
