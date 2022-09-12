import { useQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { shuffle } from "lodash";
import { Badge, Box, Button, FlatList, Text } from "native-base";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setIsAuthenticated } from "../features/auth/authSlice";
import { setWalletAddress, setWallets } from "../features/wallet/walletSlice";

const SignUpVerifySeedPhrase = ({ route }) => {
  const [firstSelection, setFirstSelection] = useState(null);
  const [lastSelection, setLastSelection] = useState(null);
  const { wallets } = route.params;
  const dispatch = useDispatch();

  const { data: seedPhrase } = useQuery(["seedPhrase"], async () => {
    const seedPhrase = await SecureStore.getItemAsync("seedPhrase");
    if (!seedPhrase) throw new Error("No seed phrase");
    return seedPhrase;
  });
  const words = useMemo(
    () => (seedPhrase ? shuffle(seedPhrase.split(" ")) : []),
    [seedPhrase]
  );

  return (
    <Box p="4">
      <Text variant="subtitle1">Verify your recovery phrase</Text>
      <Text mb="5">
        Tap the first and last word of your recovery phrase to verify.
      </Text>

      <FlatList
        data={words}
        keyExtractor={(item) => item}
        renderItem={({ item: word }) => (
          <Box position="relative" mb="2">
            <Button
              variant="subtle"
              size="sm"
              onPress={() => {
                if (!firstSelection && lastSelection !== word) {
                  setFirstSelection(word);
                } else if (firstSelection === word) {
                  setFirstSelection(null);
                } else if (!lastSelection) {
                  setLastSelection(word);
                } else if (lastSelection === word) {
                  setLastSelection(null);
                }
              }}
            >
              {word}
            </Button>
            {firstSelection === word && (
              <Badge
                colorScheme="info"
                rounded="md"
                position="absolute"
                left="1"
                top="1"
              >
                First
              </Badge>
            )}
            {lastSelection === word && (
              <Badge
                colorScheme="info"
                rounded="md"
                position="absolute"
                left="1"
                top="1"
              >
                Last
              </Badge>
            )}
          </Box>
        )}
      />
      <Button
        mt="4"
        onPress={async () => {
          if (
            firstSelection === seedPhrase.split(" ")[0] &&
            lastSelection === seedPhrase.split(" ")[words.length - 1]
          ) {
            dispatch(setIsAuthenticated(true));
            dispatch(setWalletAddress(wallets[0].address));
            dispatch(setWallets(wallets));
          } else {
            setFirstSelection(null);
            setLastSelection(null);
          }
        }}
      >
        Continue
      </Button>
    </Box>
  );
};

export default SignUpVerifySeedPhrase;
