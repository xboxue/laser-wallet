import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

const useBlocker = (enabled = false) => {
  const navigation = useNavigation();
  useEffect(() =>
    navigation.addListener("beforeRemove", (event) => {
      if (!enabled) return;
      event.preventDefault();
    })
  );
};

export default useBlocker;
