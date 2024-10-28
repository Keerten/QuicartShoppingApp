import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignInView from "./Screens/SignInView"; // Sign-in screen
import SignUpScreen from "./Screens/SignUpView"; // Sign-up screen
import AddProduct from "./Screens/AddProduct"; // Add product screen
import Clothing from "./Screens/CategoryScreens/Clothing"; // Clothing Adding Screen
import Shoes from "./Screens/CategoryScreens/Shoes"; // Shoes Adding Screen
import BeautyPersonalCare from "./Screens/CategoryScreens/BeautyPersonalCare";
import HealthWellness from "./Screens/CategoryScreens/HealthWellness";
import Jewelry from "./Screens/CategoryScreens/Jewelry";
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
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ title: "Forgot Password" }}
        />

        {/* AddProduct Screen */}
        <Stack.Screen
          name="AddProduct"
          component={AddProduct}
          options={{ title: "Add Product" }}
        />

        {/* Shoes Category Screen */}
        <Stack.Screen
          name="Shoes"
          component={Shoes}
          options={{ title: "Shoes" }}
        />

        {/* Clothing Category Screen */}
        <Stack.Screen
          name="Clothing"
          component={Clothing}
          options={{ title: "Clothing" }}
        />

        {/* HealthWellness Category Screen */}
        <Stack.Screen
          name="HealthWellness"
          component={HealthWellness}
          options={{ title: "Health and Welness" }}
        />

        {/* BeautyPersonalCare Category Screen */}
        <Stack.Screen
          name="BeautyPersonalCare"
          component={BeautyPersonalCare}
          options={{ title: "Beauty and Personal Care" }}
        />

        {/* BeautyPersonalCare Category Screen */}
        <Stack.Screen
          name="Jewelry"
          component={Jewelry}
          options={{ title: "Jewelry" }}
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
