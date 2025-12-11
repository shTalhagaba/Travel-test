import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../../utils/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { moderateScale } from "react-native-size-matters";
import Colors from "../../../utils/Colors.utils";
import { setIsLoggedIn, setToken } from "../../../store/reducers/auth-persist.reducer";
import { Formik } from "formik";
import { SigninSchema } from "../../../helper/auth.helper";

export default function Signin() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    Toast.show({
      type,
      text1: message,
      position: "top",
    });
  };

  const handleSignin = async (values: any) => {
    try {
      setLoading(true);

      const { email, password } = values;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log("Signin data:", data);

      const sessionToken = data.session?.access_token;

      if (!sessionToken) {
        showToast("error", "Something went wrong!");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("userToken", sessionToken);

      dispatch(setIsLoggedIn(true));
      dispatch(setToken(sessionToken));

      Toast.show({
        type: "success",
        text1: "Signin successful!",
        position: "top",
      });s

      setTimeout(() => {
        navigation.replace("Home");
      }, 1000);

    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={SigninSchema}
        onSubmit={handleSignin}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholderTextColor={Colors.PLACEHOLDER}
            />
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              placeholderTextColor={Colors.PLACEHOLDERs}
            />
            {errors.password && touched.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <View style={styles.linkContainer}>
                <Text>Don't have an account?</Text>
                <Text style={styles.linkText}>
                  Sign Up
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20),
    backgroundColor: Colors.BACKGROUND,
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: "800",
    color: Colors.PRIMARY,
    marginBottom: moderateScale(30),
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(15),
    backgroundColor: Colors.WHITE,
    fontSize: moderateScale(14),
    color: Colors.TEXT,
  },
  errorText: {
    color: "red",
    marginTop: moderateScale(5),
    marginLeft: moderateScale(5),
    fontSize: moderateScale(12),
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: moderateScale(14),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(25),
    alignItems: "center",
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: moderateScale(15),
  },
  linkText: {
    paddingLeft: moderateScale(5),
    fontSize: moderateScale(14),
    color: Colors.SECONDARY,
    textAlign: "center",
    fontWeight: "600",
  },
});
