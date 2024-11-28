import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/Colors";

const { height, width } = Dimensions.get("window");

export default function Page() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user) {
        if (user?.unsafeMetadata?.role) {
          router.replace("/bloglist");
        } else {
          router.replace("/list");
        }
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [user]);

  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={styles.activityIndicator}
          />
        </View>
      </SignedIn>
      <SignedOut>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/Logo.png")}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push("/sign-up")}
          >
            <Text style={styles.btnText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push("/guest")}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: width,
    height: height,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.2,
    height: height * 0.2,
  },
  logo: {
    width: width * 0.8,
    height: height * 0.2,
  },
  subContainer: {
    padding: 10,
    marginTop: 0,
  },
  titleText: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    textAlign: "center",
  },
  highlightText: {
    color: Colors.PRIMARY,
  },
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: width * 0.1,
  },
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 99,
    marginBottom: 15,
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
  activityIndicator: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
});
