import { useClerk, useSignIn } from "@clerk/clerk-expo";
import { Link, Stack } from "expo-router";
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
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Colors } from "../../constants/Colors";
import { Eye, EyeOff } from "lucide-react-native";

const { height, width } = Dimensions.get("window");

export default function Page() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isEnglish, setIsEnglish] = useState(true);
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const locale = {
    bengali: {
      title: "আসুন",
      highlightTitle: "সাইন ইন করি",
      emailPlaceholder: "ইমেল ঠিকানা",
      passwordPlaceholder: "পাসওয়ার্ড",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      signInButton: "সাইন ইন",
      noAccount: "কোনো অ্যাকাউন্ট নেই?",
      signUp: "সাইন আপ করুন",
      invalidEmail: "অবৈধ ইমেল। দয়া করে একটি বৈধ ইমেইল ঠিকানা ব্যবহার করুন",
      invalidPassword: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
      invalidCredentials: "ভুল ইমেল বা পাসওয়ার্ড",
      emptyFields: "সমস্ত ক্ষেত্র পূরণ করুন",
      error: "এরর",
    },
    english: {
      title: "Let's",
      highlightTitle: "Sign In",
      emailPlaceholder: "Email Address",
      passwordPlaceholder: "Password",
      forgotPassword: "Forgot Password?",
      signInButton: "Sign In",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      invalidEmail: "Invalid email. Please use a valid email address",
      invalidPassword: "Password must be at least 8 characters long",
      invalidCredentials: "Incorrect email or password",
      emptyFields: "Please fill in all fields",
      error: "Error",
    },
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const onSignInPress = React.useCallback(async () => {
    const currentLocale = isEnglish ? locale.english : locale.bengali;

    if (!emailAddress || !password) {
      Alert.alert(currentLocale.error, currentLocale.emptyFields);
      return;
    }

    if (!validateEmail(emailAddress)) {
      Alert.alert(currentLocale.error, currentLocale.invalidEmail);
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(currentLocale.error, currentLocale.invalidPassword);
      return;
    }

    if (!isLoaded) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      Alert.alert(currentLocale.error, currentLocale.invalidCredentials);
    }
  }, [isLoaded, emailAddress, password, isEnglish]);

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const currentLocale = isEnglish ? locale.english : locale.bengali;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
        <Text style={styles.languageToggleText}>
          {isEnglish ? "বাংলা" : "English"}
        </Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Text style={styles.titleText}>
          {currentLocale.title}{" "}
          <Text style={styles.highlightText}>
            {currentLocale.highlightTitle}
          </Text>
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder={currentLocale.emailPlaceholder}
          placeholderTextColor="#888"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            placeholder={currentLocale.passwordPlaceholder}
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            onChangeText={(password) => setPassword(password)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#888" />
            ) : (
              <Eye size={20} color="#888" />
            )}
          </TouchableOpacity>
        </View>

        <Link href="/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>
              {currentLocale.forgotPassword}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onSignInPress}>
        <Text style={styles.btnText}>{currentLocale.signInButton}</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>{currentLocale.noAccount}</Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text style={styles.signupLinkText}>{currentLocale.signUp}</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  languageToggle: {
    position: "absolute",
    top: height * 0.07,
    right: width * 0.05,
    padding: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
  },
  languageToggleText: {
    color: "#fff",
    fontFamily: "outfit-medium",
    fontSize: 12,
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
  passwordContainer: {
    position: "relative",
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
    padding: 15,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
    fontSize: 14,
  },
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 99,
    marginHorizontal: width * 0.1,
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
});
