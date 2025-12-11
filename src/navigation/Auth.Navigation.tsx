
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "../screens/auth/SignIn/SignIn";
import SignUp from "../screens/auth/SignUp/SignUp";

const Stack = createNativeStackNavigator();

const AuthNavigation = () => (

  <Stack.Navigator
    initialRouteName="SignIn"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="SignIn" component={SignIn} />
    <Stack.Screen name="SignUp" component={SignUp} />
    
  </Stack.Navigator>

);

export default AuthNavigation;
