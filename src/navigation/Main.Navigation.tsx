
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import Colors from "../utils/Colors.utils";
import Home from "../screens/main/Home/Home";
import MainTabs from "./Tab.navigation";
import Profile from "../screens/main/Profile/Profile";

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        setUserRole(role);
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setLoading(false);
      }
    };
    getRole();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.WHITE,
        }}
      >
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={userRole === "mechanic" ? "MechanicHome" : "Tab"}
      screenOptions={{ headerShown: false }}
    >
   
      <Stack.Screen name="Tab" component={MainTabs} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="MyProfile" component={Profile} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
