import { FlashList } from "@shopify/flash-list";
import { AspectRatio, Image, Skeleton } from "native-base";
import useCollectibles from "../../hooks/useCollectibles";
import { ResizeMode, Video } from "expo-av";
import { useMemo } from "react";

interface Props {
  walletAddress: string;
  limit?: number;
}

const CollectibleGrid = ({ walletAddress, limit }: Props) => {
  const { data, fetchNextPage } = useCollectibles(walletAddress);
  const collectibles = useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data]
  );

  return (
    <FlashList
      data={collectibles.slice(0, limit)}
      estimatedItemSize={131}
      numColumns={3}
      // onEndReachedThreshold={0.2}
      onEndReached={fetchNextPage}
      renderItem={({ item }) => (
        <AspectRatio flex={1} ratio={1} m="1">
          {item.nft.previews ? (
            <Image
              source={{ uri: item.nft.previews[0].URI }}
              alt="Collectible"
              rounded="lg"
            />
          ) : (
            <Video
              source={{ uri: item.nft.media.URI }}
              resizeMode={ResizeMode.CONTAIN}
            />
          )}
        </AspectRatio>
      )}
    />
  );
};

export default CollectibleGrid;
