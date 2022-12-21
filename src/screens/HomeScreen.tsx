import { Linking, RefreshControl } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import {
  Box,
  Button,
  Icon,
  Image,
  ScrollView,
  Stack,
  Text,
  useToast,
} from "native-base";
import { useState } from "react";
import { Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import lockIcon from "../../assets/lock.png";
import clockIcon from "../../assets/clock.png";
import ActionCard from "../components/ActionCard/ActionCard";
import CollectibleGrid from "../components/CollectibleGrid/CollectibleGrid";
import DeployBottomSheet from "../components/DeployBottomSheet/DeployBottomSheet";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import { selectChainId } from "../features/network/networkSlice";
import {
  selectSafeDeployTxHash,
  selectWalletAddress,
  setSafeDeployTxHash,
} from "../features/wallet/walletSlice";
import useCollectibles from "../hooks/useCollectibles";
import usePendingTxSubscription from "../hooks/usePendingTxSubscription";
import useWaitForTransaction from "../hooks/useWaitForTransaction";
import { getSafeService } from "../services/safe";
import formatAddress from "../utils/formatAddress";
import useBalances from "../hooks/useBalances";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  const { refetch: refetchCollectibles, data } = useCollectibles(walletAddress);
  const toast = useToast();
  const [deploySheetOpen, setDeploySheetOpen] = useState(false);
  const chainId = useSelector(selectChainId);
  const dispatch = useDispatch();
  const safeDeployTxHash = useSelector(selectSafeDeployTxHash);
  const { refetch: refetchBalances, isRefetching } = useBalances(walletAddress);

  useWaitForTransaction({
    hash: safeDeployTxHash,
    chainId,
    onSuccess: () => {
      refetchSafeCreationInfo();
      dispatch(setSafeDeployTxHash(null));
    },
  });

  const {
    data: safeCreationInfo,
    isLoading: safeCreationInfoLoading,
    refetch: refetchSafeCreationInfo,
  } = useQuery(
    ["safeCreationInfo", walletAddress],
    async () => {
      const safeService = getSafeService(chainId);
      try {
        const safeCreationInfo = await safeService.getSafeCreationInfo(
          walletAddress
        );
        return safeCreationInfo;
      } catch (error) {
        return null;
      }
    },
    { disableErrorToast: true }
  );

  usePendingTxSubscription();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 60,
        paddingHorizontal: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            refetchBalances();
            refetchCollectibles();
            refetchSafeCreationInfo();
          }}
        />
      }
    >
      {deploySheetOpen && (
        <DeployBottomSheet
          isOpen={deploySheetOpen}
          onClose={() => setDeploySheetOpen(false)}
          onSuccess={(hash) => {
            dispatch(setSafeDeployTxHash(hash));
            setDeploySheetOpen(false);
          }}
        />
      )}
      <Text variant="h4" fontWeight="500" mb="6">
        Your assets
      </Text>
      <Box p="6" bgColor="#4F5AFF33">
        <WalletBalance walletAddress={walletAddress} />

        <Text color="#FFFFFFB2" mt="2">
          Address
        </Text>
        <Pressable
          onPress={() => {
            Clipboard.setStringAsync(walletAddress);
            toast.show({
              render: () => (
                <ToastAlert status="success" title="Copied to clipboard" />
              ),
              duration: 2000,
            });
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <Text>{formatAddress(walletAddress)}</Text>
            <Icon size="xs" as={<Feather name="copy" />} color="white" ml="1" />
          </Box>
        </Pressable>
        <Stack direction="row" space={2} mt="4">
          <Button
            onPress={() => Linking.openURL("https://buy.moonpay.com")}
            flex={1}
            rounded="full"
          >
            Buy
          </Button>
          <Button
            onPress={() => {
              if (!safeCreationInfo) return setDeploySheetOpen(true);
              navigation.navigate("Choose Recipient");
            }}
            flex={1}
            rounded="full"
          >
            Send
          </Button>
        </Stack>
      </Box>
      {!safeCreationInfoLoading &&
        !safeCreationInfo &&
        (safeDeployTxHash ? (
          <ActionCard
            onPress={() => {}}
            title="Account activating"
            subtitle="This may take up to 1 hour"
            icon={<Image source={clockIcon} size="10" mr="1" alt="Clock" />}
            key={safeDeployTxHash}
            mt="4"
          />
        ) : (
          <ActionCard
            onPress={() => setDeploySheetOpen(true)}
            title="Activate your account"
            subtitle="Get started by depositing ETH"
            icon={<Image source={lockIcon} size="10" mr="1" alt="Padlock" />}
            key={safeDeployTxHash}
            mt="4"
          />
        ))}
      <Box flexDir="row" justifyContent="space-between" mt="6" mb="1">
        <Text variant="subtitle1">Coins</Text>
        <Pressable onPress={() => navigation.navigate("TokenBalances")}>
          <Text>View all</Text>
        </Pressable>
      </Box>
      <TokenBalances
        walletAddress={walletAddress}
        limit={4}
        onPress={() => {}}
      />
      {!!data?.pages?.[0].results.length && (
        <>
          <Box flexDir="row" justifyContent="space-between" mt="6" mb="1">
            <Text variant="subtitle1">Collectibles</Text>
            <Pressable onPress={() => navigation.navigate("Collectibles")}>
              <Text>View all</Text>
            </Pressable>
          </Box>
          <Box mx="-1" flex="1">
            <CollectibleGrid walletAddress={walletAddress} limit={3} />
          </Box>
        </>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
