import { isAddress } from "ethers/lib/utils";
import { Skeleton } from "native-base";
import { useSelector } from "react-redux";
import { useEnsAddress, useEnsAvatar } from "wagmi";
import { selectChainId } from "../../../features/network/networkSlice";
import AddressOrEnsPreviewItem from "../../AddressOrEnsPreviewItem/AddressOrEnsPreviewItem";

interface Props {
  ensName: string;
  onPress: (address: string, ensName?: string) => void;
  errorComponent: React.ReactNode;
}

const EnsPreviewContainer = ({ ensName, onPress, errorComponent }: Props) => {
  const chainId = useSelector(selectChainId);

  // Resolve ENS name to address
  const { data: address, isLoading: addressLoading } = useEnsAddress({
    name: ensName,
    chainId,
  });

  // Fetch ENS avatar
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: ensName,
    chainId,
  });

  if (addressLoading || ensAvatarLoading) return <Skeleton />;
  if (!address || !isAddress(address)) return <>{errorComponent}</>;

  return (
    <AddressOrEnsPreviewItem
      address={address}
      ensName={ensName}
      ensAvatar={ensAvatar as string}
      onPress={onPress}
    />
  );
};

export default EnsPreviewContainer;
