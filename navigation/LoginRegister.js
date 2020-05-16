import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator
} from "react-navigation-stack";
import {
  createBottomTabNavigator
} from "react-navigation-tabs";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TabBarIcon from "../components/TabBarIcon";

// Login / Register Navigation Stack Navigator



const LoginStack = createStackNavigator({
  Login: LoginScreen
});

LoginStack.navigationOptions = {
  tabBarLabel: "Login",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === "ios"
          ? `ios-information-circle${focused ? "" : "-outline"}`
          : "md-information-circle"
      }
    />
  )
};

const RegisterStack = createStackNavigator({
  Register: RegisterScreen
});

RegisterStack.navigationOptions = {
  tabBarLabel: "Register",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-link" : "md-link"}
    />
  )
};

export default createBottomTabNavigator({
  Login: LoginStack,
  Register: RegisterStack
});
