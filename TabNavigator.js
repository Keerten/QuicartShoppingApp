import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import HomeStackNavigator from "./HomeStackNavigator"; // Stack containing ProductList, ProductDetails, Shoes, Clothing
import Favorites from "./Screens/Favorites"; // Your Favorites screen component
import Cart from "./Screens/Cart"; // Your Cart screen component
import Profile from "./Screens/Profile"; // Your Profile screen component

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Favorites") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Cart") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        headerShown: true, // Show header on each tab
      })}
    >
      {/* Home tab with stack navigation and title */}
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ headerShown: false }} // Hide header for Home
      />

      {/* Favorites tab with title */}
      <Tab.Screen
        name="Favorites"
        component={Favorites}
        options={{ headerTitle: "Favorites" }}
      />

      {/* Cart tab with title */}
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{ headerTitle: "Your Cart" }}
      />

      {/* Profile tab with title */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerTitle: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
