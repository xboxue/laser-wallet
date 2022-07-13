import { useNavigation } from "@react-navigation/native";
import { isAddress } from "ethers/lib/utils";
import { Avatar, Box, Button, Input, Skeleton, Text } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useEnsAddress, useEnsAvatar } from "wagmi";
import { DEFAULT_CHAIN } from "../constants/chains";
import { addGuardian } from "../features/guardians/guardiansSlice";
import formatAddress from "../utils/formatAddress";

const SignUpAddGuardianScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const dispatch = useDispatch();

  const { data: ensAddress, isLoading: ensAddressLoading } = useEnsAddress({
    name: value,
    enabled: value.includes("."),
    chainId: DEFAULT_CHAIN,
  });

  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: value,
    enabled: !!ensAddress,
    chainId: DEFAULT_CHAIN,
  });

  const renderItem = () => {
    if (isAddress(value))
      return (
        <Box flexDirection="row" alignItems="center" mt="3">
          <Avatar>0x</Avatar>
          <Text ml="2" variant="subtitle1">
            {formatAddress(value)}
          </Text>
        </Box>
      );

    if (ensAddressLoading || ensAvatarLoading) return <Skeleton />;

    if (ensAddress && isAddress(ensAddress))
      return (
        <Box flexDirection="row" alignItems="center" mt="3">
          <Avatar source={ensAvatar ? { uri: ensAvatar } : undefined}>
            {value[0]}
          </Avatar>
          <Box ml="2">
            <Text variant="subtitle1">{value}</Text>
            <Text>{formatAddress(ensAddress)}</Text>
          </Box>
        </Box>
      );

    if (value) return <Text mt="1">Invalid address</Text>;
  };

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1" mb="4">
          Add guardian
        </Text>
        <Input
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoFocus
          size="lg"
        />
        <Input
          mt="3"
          placeholder="Address or ENS"
          value={value}
          onChangeText={setValue}
          size="lg"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {renderItem()}
        <Button
          mt="4"
          isDisabled={
            !isAddress(value) && !(ensAddress && isAddress(ensAddress))
          }
          onPress={async () => {
            if (!isAddress(value) && !(ensAddress && isAddress(ensAddress)))
              return;
            dispatch(
              addGuardian({
                name,
                address: isAddress(value) ? value : (ensAddress as string),
                ensName: ensAddress ? value : undefined,
              })
            );
            navigation.goBack();
          }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpAddGuardianScreen;
