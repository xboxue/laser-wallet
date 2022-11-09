import { FlashList } from "@shopify/flash-list";
import { AspectRatio, Image, Skeleton } from "native-base";
import useCollectibles from "../../hooks/useCollectibles";
import { Video } from "expo-av";

interface Props {
  walletAddress: string;
  limit?: number;
}

const CollectibleGrid = ({ walletAddress, limit }: Props) => {
  const { data: collectibles } = useCollectibles(walletAddress);

  return (
    <FlashList
      data={collectibles.slice(0, limit)}
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
