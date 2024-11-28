import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, Link, Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { Colors } from "../../constants/Colors";
import { Check, Eye, EyeOff } from "lucide-react-native";

const { height, width } = Dimensions.get("window");

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [currentStep, setCurrentStep] = useState("email");
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onRequestReset = async () => {
    // Validate email before proceeding
    if (!validateEmail(emailAddress)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setCurrentStep("code");
      setResetCodeSent(true);
    } catch (err) {
      if (err.errors[0].message?.includes("invalid"))
        Alert.alert("Error", "No user found with this email address");
      else {
        Alert.alert("Error", err.errors[0].message);
      }
    }
  };

  const onReset = async () => {
    // Validate password length
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        setCurrentStep("success");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      if (err.errors[0].message?.includes("incorrect"))
        Alert.alert("Error", "Entered reset code is incorrect");
      else if (err.errors[0].message?.includes("data breach")) {
        Alert.alert(
          "Error",
          "Password has been found in an online data breach. For account safety, please use a different password."
        );
      } else if (err.errors[0].message?.includes("failed")) {
        Alert.alert(
          "Error",
          "Too many failed attempts. You have to try again with the same or another method."
        );
      } else Alert.alert("Error", err.errors[0].message);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email Address"
              placeholderTextColor="#888"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
            />

            {resetCodeSent && (
              <Text style={styles.resetCodeText}>
                A 6-digit password reset code has been sent to{" "}
                <Text style={styles.boldEmail}>{emailAddress}</Text>
              </Text>
            )}

            <TouchableOpacity style={styles.btn} onPress={onRequestReset}>
              <Text style={styles.btnText}>Send Reset Code</Text>
            </TouchableOpacity>
          </View>
        );

      case "code":
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter Reset Code"
              placeholderTextColor="#888"
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                placeholder="New Password"
                placeholderTextColor="#888"
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                maxLength={32}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeOff size={24} color="#888" />
                ) : (
                  <Eye size={24} color="#888" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btn} onPress={onReset}>
              <Text style={styles.btnText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        );

      case "success":
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Check size={64} color="white" />
            </View>
            <Text style={styles.successTitle}>Password Reset</Text>
            <Text style={styles.successSubtitle}>
              Your password has been successfully reset
            </Text>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.logoContainer}>
        <Text style={styles.titleText}>
          Reset <Text style={styles.highlightText}>Password</Text>
        </Text>
      </View>

      {renderContent()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.1,
    marginBottom: height * 0.05,
  },
  titleText: {
    fontSize: 24,
    fontFamily: "outfit-bold",
    textAlign: "center",
  },
  highlightText: {
    color: Colors.PRIMARY,
  },
  inputContainer: {
    paddingHorizontal: width * 0.1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontFamily: "outfit",
    fontSize: 16,
  },
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 99,
    marginTop: 20,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "outfit-bold",
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontFamily: "outfit",
    marginRight: 5,
  },
  signupLinkText: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
  },
  successContainer: {
    alignItems: "center",
    paddingHorizontal: width * 0.1,
  },
  successIconContainer: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 100,
    padding: 20,
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: "outfit-bold",
    fontSize: 24,
    marginBottom: 10,
    color: Colors.PRIMARY,
  },
  successSubtitle: {
    fontFamily: "outfit",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontFamily: "outfit",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  resetCodeText: {
    marginBottom: 15,
    fontFamily: "outfit",
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  boldEmail: {
    fontFamily: "outfit-bold",
    color: Colors.PRIMARY,
  },
});
