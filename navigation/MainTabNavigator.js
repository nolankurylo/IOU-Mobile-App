import React from "react";
import { Platform } from "react-native";
import {
  createBottomTabNavigator
} from "react-navigation-tabs";
import {
  createStackNavigator
} from "react-navigation-stack";
import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen"
import AddHouseFriendsScreen from "../screens/AddHouseFriendsScreen"
import CreateHouseNameScreen from "../screens/CreateHouseNameScreen"
import HouseScreen from "../screens/HouseScreen"
import IOUHistoryScreen from "../screens/IOUHistoryScreen"
import NecessitiesScreen from "../screens/NecessitiesScreen"
import HouseSettingsScreen from "../screens/HouseSettingsScreen";

// Main Tab Bar Nagivation Stack Bottom Tab Navigator
// Once the user has properly registered and logged in, they will be brought to this stack navigator
// After registration and login, on app load, the user will be brought to this stack navigator unless they had previously logged out

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  CreateHouseName: CreateHouseNameScreen,
  AddHouseFriends: AddHouseFriendsScreen,
  House: HouseScreen,
  IOUHistory: IOUHistoryScreen,
  Necessities: NecessitiesScreen,
  HouseSettings: HouseSettingsScreen
});

HomeStack.navigationOptions = ({navigation}) => {
  const { routeName } = navigation.state.routes[navigation.state.index];
  tabBarVisible = true
  // Depending on the screen, disable the bottom tab bar navigation
  // Necessary to coordinate specific sequences the user may follow
  if (routeName === 'AddHouseFriends' || routeName === 'CreateHouseName' || routeName === 'IOUHistory' || routeName === 'HouseSettings'){
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
    tabBarLabel: "Houses",
    tabBarIcon: ({ focused }) => (
      <TabBarIcon
        focused={focused}
        name={Platform.OS === "ios" ? "ios-home" : "md-information-circle"}
      />
    )
    }
};

const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
  Notifications: NotificationsScreen

});

ProfileStack.navigationOptions = {
  tabBarLabel: "You",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-person" : "md-options"}
    />
  )
};

const SearchStack = createStackNavigator({
  Search: {
    screen: SearchScreen
  }
});

SearchStack.navigationOptions = {
  tabBarLabel: "Find Friends",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-search" : "md-options"}
    />
  )
};

export default createBottomTabNavigator({
  Home: HomeStack,
  Search: SearchStack,
  Profile: ProfileStack
});
