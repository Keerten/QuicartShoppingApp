import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { auth } from "../Configs/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignInView = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateInputs = () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long."
      );
      return false;
    }
    return true;
  };

  const onSignInClicked = async () => {
    if (!validateInputs()) return;

    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Successfully logged in:", userCredentials.user.email);
      navigation.replace("Tabs"); // Use replace instead of navigate to avoid going back to sign-in
    } catch (error) {
      handleSignInError(error);
    }
  };

  const handleSignInError = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        Alert.alert(
          "User Not Found",
          "No account found with the given email address."
        );
        break;
      case "auth/wrong-password":
        Alert.alert("Incorrect Password", "The password you entered is wrong.");
        break;
      case "auth/invalid-email":
        Alert.alert("Invalid Email", "The email address format is incorrect.");
        break;
      case "auth/invalid-credential":
        Alert.alert(
          "Invalid Credentials",
          "Please check your email and password and try again."
        );
        break;
      default:
        Alert.alert(
          "Sign-In Error",
          "An unexpected error occurred. Please try again later."
        );
        break;
    }
  };

  const onSignUpClicked = () => {
    navigation.navigate("SignUp");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to Quicart Account!</Text>
      <TextInput
        style={styles.inputStyle}
        placeholder="Email"
        textContentType="emailAddress"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder="Password"
        textContentType="password"
        secureTextEntry={true}
        autoCapitalize="none"
        returnKeyType="done"
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.buttonStyle} onPress={onSignInClicked}>
        <Text style={styles.buttonTextStyle}>Sign In</Text>
      </Pressable>
      <Pressable style={styles.buttonStyle} onPress={onSignUpClicked}>
        <Text style={styles.buttonTextStyle}>Create a New Account</Text>
      </Pressable>
    </View>
  );
};

export default SignInView;

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
