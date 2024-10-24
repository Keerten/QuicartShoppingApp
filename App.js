import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignInView from "./Screens/SignInView"; // Sign-in screen
import SignUpScreen from "./Screens/SignUpView"; // Sign-up screen
import AddProduct from "./Screens/AddProduct"; // Add product screen
import TabNavigator from "./TabNavigator"; // Tab navigator
import ForgotPassword from "./Screens/ForgotPassword";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        {/* SignIn Screen */}
        <Stack.Screen
          name="SignIn"
          component={SignInView}
          options={{ headerShown: false }}
        />

        {/* SignUp Screen */}
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "Sign Up" }}
        />

        <Stack.Screen
          name = "ForgotPassword"
          component={ForgotPassword}
          options={{title : "Forgot Password"}}
        />

        {/* AddProduct Screen */}
        <Stack.Screen
          name="AddProduct"
          component={AddProduct}
          options={{ title: "Add Product" }}
        />

        {/* HomeTabs to handle Home, Favorites, Cart, Profile */}
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }} // Hide header for tab navigator
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
