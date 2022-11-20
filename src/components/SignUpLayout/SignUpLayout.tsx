import { Box, Button, Text } from "native-base";

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
    <Box p="4" pb="6" flex="1">
      <Text variant="h4" mb="1">
        {title}
      </Text>
      <Text fontSize="lg" mb="10">
        {subtitle}
      </Text>
      {children}
      <Box flexDir="row" mt="auto">
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
    </Box>
  );
};

export default SignUpLayout;
