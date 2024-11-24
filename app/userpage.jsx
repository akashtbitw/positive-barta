import { View, Text } from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function userpage() {
  const user = useUser();
  return (
    <View>
      {user.user.unsafeMetadata?.role ? (
        <Redirect href={"/(admin)/bloglist"}></Redirect>
      ) : (
        <Redirect href={"/(tabs)/home"}></Redirect>
      )}
    </View>
  );
}
