
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import {
  User,
} from "lucide-react-native";
import { HomeTab } from "../assets/pngs";
import Colors from "../utils/Colors.utils";
import Home from "../screens/main/Home/Home";
import Profile from "../screens/main/Profile/Profile";


type MainTabsParamList = {
  auth: undefined;
  Home: undefined;
  Job: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs = () => {

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.GRAY,
        tabBarStyle: {
          backgroundColor: Colors.WHITE,
          borderTopColor: Colors.GRAY,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={HomeTab}
              style={{
                width: size + 2,
                height: size + 2,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
     
       <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <User size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;


