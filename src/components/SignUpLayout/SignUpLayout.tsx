import { Box, Button, KeyboardAvoidingView, Text } from "native-base";

interface Props {
  onNext: () => void;
  onSkip?: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  nextText?: string;
  showSkip?: boolean;
}

const SignUpLayout = ({
  onNext,
  onSkip,
  title,
  subtitle,
  children,
  isLoading,
  isDisabled,
  nextText = "Next",
  showSkip = false,
}: Props) => {
  return (
    <Box safeAreaBottom flex="1">
      <KeyboardAvoidingView
        p="4"
        keyboardVerticalOffset={110}
        behavior="padding"
        flex="1"
      >
        <Text variant="h4" mb="1">
          {title}
        </Text>
        <Text fontSize="lg" mb="10">
          {subtitle}
        </Text>
        {children}
        <Box flex="1" />
        <Box flexDir="row">
          {showSkip && (
            <Button
              variant="subtle"
              _text={{ fontSize: "lg" }}
              flex="1"
              onPress={onSkip}
              mr="4"
            >
              Skip
            </Button>
          )}
          <Button
            _text={{ fontSize: "lg" }}
            onPress={onNext}
            isLoading={isLoading}
            isDisabled={isDisabled}
            flex="1"
          >
            {nextText}
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
};

export default SignUpLayout;
