import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const useSecureStore = (key: string) => {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(key).then(setValue);
  }, [key]);

  return value;
};

export default useSecureStore;
