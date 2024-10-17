import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProductList from "./Screens/ProductList";
import ProductDetails from "./Screens/ProductDetails";
import Shoes from "./Screens/CategoryScreens/Shoes";
import Clothing from "./Screens/CategoryScreens/Clothing";
import Icon from "react-native-vector-icons/Ionicons";
import { View, Pressable } from "react-native";
import { auth } from "./Configs/FirebaseConfig";
import { signOut } from "firebase/auth";

const Stack = createStackNavigator();

const logout = async (navigation) => {
  try {
    await signOut(auth);
    console.log("Successfully signed out");
    if (navigation.canGoBack()) {
      navigation.popToTop(); // Navigate to the top of the stack
    }
    navigation.replace("SignIn"); // Navigate to sign-in after logout
  } catch (err) {
    console.log(`Error while logging out: ${err}`);
  }
};

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="ProductList">
      {/* ProductList Screen */}
      <Stack.Screen
        name="ProductList"
        component={ProductList}
        options={({ navigation }) => ({
          title: "Home",
          headerRight: () => (
            <View style={{ flexDirection: "row", paddingRight: 20 }}>
              <Pressable onPress={() => logout(navigation)}>
                <Icon name="log-out-outline" size={35} color="black" />
              </Pressable>
            </View>
          ),
        })}
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

      {/* ProductDetails Screen */}
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{ title: "Product Details" }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
