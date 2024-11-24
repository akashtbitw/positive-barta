import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { useWarmUpBrowser } from "./../hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { Redirect } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const { height, width } = Dimensions.get("window");

export default function LoginScreen() {
  useWarmUpBrowser();
  const navigation = useNavigation();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Handle unsuccessful OAuth flow
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  const handleSkip = () => console.log("skipped");

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("./../assets/images/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.titleText}>
          আজকের <Text style={styles.highlightText}>তাজা খবর</Text> আপনার হাতের
          মুঠোয়।
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.2,
    height: height * 0.2, // Reduced height of logo container
  },
  logo: {
    width: width * 0.8,
    height: height * 0.2,
  },
  subContainer: {
    padding: 10,
    marginTop: 0, // Removed top margin to reduce gap
  },
  titleText: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    textAlign: "center",
  },
  highlightText: {
    color: Colors.PRIMARY,
  },
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 99,
    marginTop: 40,
    marginHorizontal: width * 0.1,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "outfit",
    fontSize: 16,
  },
  skipButton: {
    marginTop: 20,
    alignItems: "center",
    padding: 10,
  },
  skipText: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-medium",
    fontSize: 16,
  },
});
