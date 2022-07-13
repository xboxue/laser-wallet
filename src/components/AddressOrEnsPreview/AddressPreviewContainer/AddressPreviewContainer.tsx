import { isAddress } from "ethers/lib/utils";
import { Skeleton } from "native-base";
import { useSelector } from "react-redux";
import { useEnsAvatar, useEnsName } from "wagmi";
import { selectChainId } from "../../../features/network/networkSlice";
import AddressOrEnsPreviewItem from "../../AddressOrEnsPreviewItem/AddressOrEnsPreviewItem";

interface Props {
  address: string;
  onPress: (address: string, ensName?: string) => void;
}

const AddressPreviewContainer = ({ address, onPress }: Props) => {
  const chainId = useSelector(selectChainId);

  // Resolve address to ENS name if input is a valid address
  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address,
    enabled: isAddress(address),
    chainId,
  });

  // Fetch ENS avatar if address resolved to an ENS name
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: ensName as string,
    enabled: !!ensName,
    chainId,
  });

  if (ensNameLoading || ensAvatarLoading) return <Skeleton />;

  return (
    <AddressOrEnsPreviewItem
      address={address}
      ensName={ensName as string}
      ensAvatar={ensAvatar as string}
      onPress={onPress}
    />
  );
};

export default AddressPreviewContainer;
