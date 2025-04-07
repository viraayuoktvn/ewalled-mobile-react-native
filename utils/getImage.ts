import { Platform } from "react-native";
import { imageMap } from "./imageMap";

  export const getImage = (name: string) => {
    if (Platform.OS === "web") {
      return { uri: `/images/${name}` };
    }
  
    return imageMap[name] || imageMap["avatar.png"];
  };