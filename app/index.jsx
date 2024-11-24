import { Redirect, useNavigation } from "expo-router";
export default function Index() {
  return <Redirect href={"/userpage"}></Redirect>;
}
