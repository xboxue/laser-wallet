import { Skeleton } from "native-base";
import useEnsNameAndAvatar from "../../hooks/useEnsNameAndAvatar";
import AddressOrEnsPreviewItem from "../AddressOrEnsPreviewItem/AddressOrEnsPreviewItem";

interface Props {
  address: string;
  onPress?: (address: string, ensName?: string) => void;
}

const AddressPreviewContainer = ({ address, onPress }: Props) => {
  const { ensName, ensAvatar, isLoading } = useEnsNameAndAvatar(address);

  if (isLoading) return <Skeleton />;

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
