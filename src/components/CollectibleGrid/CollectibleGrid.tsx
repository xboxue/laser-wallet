import { FlashList } from "@shopify/flash-list";
import { AspectRatio, Image } from "native-base";
import useCollectibles from "../../hooks/useCollectibles";

interface Props {
  walletAddress: string;
}

const CollectibleGrid = ({ walletAddress }: Props) => {
  const { data: collectibles } = useCollectibles(walletAddress);

  return (
    <FlashList
      data={collectibles}
      estimatedItemSize={131}
      numColumns={3}
      renderItem={({ item }) => (
        <AspectRatio flex={1} ratio={1} m="1">
          <Image
            source={{ uri: item.image_url }}
            alt="Collectible"
            rounded="lg"
          />
        </AspectRatio>
      )}
    />
  );
};

export default CollectibleGrid;
