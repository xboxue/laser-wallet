import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { useTheme } from "native-base";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const BottomSheet = ({ children, isOpen, onClose }: Props) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], []);
  const theme = useTheme();

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  useEffect(() => {
    if (isOpen) bottomSheetRef.current?.present();
    else bottomSheetRef.current?.collapse();
  }, [isOpen]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) onClose();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.gray[900] }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.gray[700] }}
    >
      <BottomSheetView onLayout={handleContentLayout}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default BottomSheet;
