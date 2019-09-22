import React from "react";
import {
  createAppContainer,
  createSwitchNavigator
} from "react-navigation";
import MainTabNavigator from "./MainTabNavigator";
import LoginRegister from "./LoginRegister";

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: LoginRegister,
      Auth: MainTabNavigator
    },
    { initialRouteName: "AuthLoading", initialRouteParams: "hello" }
  )
);
