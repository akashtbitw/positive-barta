import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter, Stack } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Eye, EyeOff } from "lucide-react-native";

const { height, width } = Dimensions.get("window");

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isEnglish, setIsEnglish] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [emailText, setEmailText] = React.useState("");

  const locale = {
    bengali: {
      title: "নতুন",
      highlightTitle: "অ্যাকাউন্ট",
      firstName: "প্রথম নাম",
      lastName: "শেষ নাম",
      emailPlaceholder: "ইমেল ঠিকানা",
      passwordPlaceholder: "পাসওয়ার্ড",
      signUpButton: "সাইন আপ",
      verifyCode: "ভেরিফিকেশন কোড",
      verifyButton: "ইমেল ভেরিফাই করুন",
      emptyFields: "সমস্ত ক্ষেত্র পূরণ করুন",
      invalidEmail: "অবৈধ ইমেল। দয়া করে একটি বৈধ ইমেইল ঠিকানা ব্যবহার করুন",
      invalidPassword: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
      signupError: "ইমেল ঠিকানা বিদ্যমান নেই",
      invalidCode: "অবৈধ কোড। দয়া করে ৬ সংখ্যার কোড লিখুন",
      verificationFailed: "ভেরিফিকেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন",
      emailExists: "এই ইমেল ঠিকানা ইতিমধ্যে ব্যবহৃত হয়েছে",
      verificationMessage: "৬ সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে ",
      emailSentTo: " ইমেইলে",
      error: "এরর",
    },
    english: {
      title: "Create",
      highlightTitle: "Account",
      firstName: "First Name",
      lastName: "Last Name",
      emailPlaceholder: "Email Address",
      passwordPlaceholder: "Password",
      signUpButton: "Sign Up",
      verifyCode: "Verification Code",
      verifyButton: "Verify Email",
      emptyFields: "Please fill in all fields",
      invalidEmail: "Invalid email. Please use a valid email address",
      invalidPassword: "Password must be at least 8 characters long",
      signupError: "Email address doesn't exist",
      invalidCode: "Invalid code. Please enter 6 digits",
      verificationFailed: "Verification failed. Please try again",
      emailExists: "This email address is already in use",
      verificationMessage: "A 6-digit verification code has been sent to ",
      emailSentTo: " email",
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

  const validateVerificationCode = (code) => {
    return /^\d{6}$/.test(code);
  };

  const onSignUpPress = async () => {
    const currentLocale = isEnglish ? locale.english : locale.bengali;

    if (!firstName || !lastName || !emailAddress || !password) {
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
      const signUpResponse = await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setEmailText(emailAddress);
      setPendingVerification(true);
    } catch (err) {
      console.log(err);

      if (err.errors?.[0]?.message?.includes("data breach")) {
        Alert.alert(
          currentLocale.error,
          "Password has been found in an online data breach. For account safety, please use a different password."
        );
      } else if (err.errors?.[0]?.message?.includes("taken")) {
        Alert.alert(currentLocale.error, currentLocale.emailExists);
      } else {
        Alert.alert(currentLocale.error, currentLocale.signupError);
      }
    }
  };

  const onPressVerify = async () => {
    const currentLocale = isEnglish ? locale.english : locale.bengali;

    if (!code) {
      Alert.alert(currentLocale.error, currentLocale.emptyFields);
      return;
    }

    if (!validateVerificationCode(code)) {
      Alert.alert(currentLocale.error, currentLocale.invalidCode);
      return;
    }

    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        setEmailText("");
        router.replace("/");
      } else {
        Alert.alert(currentLocale.error, currentLocale.verificationFailed);
      }
    } catch (err) {
      Alert.alert(currentLocale.error, err.errors[0].message);
    }
  };

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };
  const handleCodeChange = (text) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = text.replace(/[^0-9]/g, "");
    if (numericValue.length <= 6) {
      setCode(numericValue);
    }
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

      {!pendingVerification ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            autoCapitalize="words"
            value={firstName}
            placeholder={currentLocale.firstName}
            placeholderTextColor="#888"
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            autoCapitalize="words"
            value={lastName}
            placeholder={currentLocale.lastName}
            placeholderTextColor="#888"
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            placeholder={currentLocale.emailPlaceholder}
            placeholderTextColor="#888"
            onChangeText={setEmailAddress}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              placeholder={currentLocale.passwordPlaceholder}
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye size={20} color="#888" />
              ) : (
                <EyeOff size={20} color="#888" />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.btn} onPress={onSignUpPress}>
            <Text style={styles.btnText}>{currentLocale.signUpButton}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.verificationText}>
            {currentLocale.verificationMessage}
            <Text style={styles.boldEmail}>{emailText}</Text>
            {currentLocale.emailSentTo}
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder={currentLocale.verifyCode}
            placeholderTextColor="#888"
            onChangeText={handleCodeChange}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity style={styles.btn} onPress={onPressVerify}>
            <Text style={styles.btnText}>{currentLocale.verifyButton}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  verificationText: {
    fontFamily: "outfit-medium",
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  boldEmail: {
    fontFamily: "outfit-bold",
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
});
