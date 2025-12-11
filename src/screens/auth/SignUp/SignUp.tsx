import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { moderateScale } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../../utils/supabaseClient";
import Colors from "../../../utils/Colors.utils";
import { Formik } from "formik";
import { SignupSchema } from "../../../helper/auth.helper";

export default function Signup() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values: any) => {
    try {
      setLoading(true);

      const { name, email, password } = values;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Signup failed",
          position: "top",
        });
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: name.trim(),
          email: email.trim(),
        });

      if (profileError) throw profileError;

      Toast.show({
        type: "success",
        text1: "Account created successfully",
        position: "top",
      });
      navigation.navigate("SignIn");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Signup failed",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={SignupSchema}
        onSubmit={handleSignup}
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
              placeholder="Name"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.name && touched.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.password && touched.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.WHITE} />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <View style={styles.linkContainer}>
                <Text>Already have an account?</Text>
                <Text style={styles.linkText}>
                  Sign In
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
