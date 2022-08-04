import { Alert, Box, IAlertProps, Text } from "native-base";

const ToastAlert = ({ title, description, ...AlertProps }: IAlertProps) => {
  return (
    <Alert flexDir="row" alignItems="flex-start" {...AlertProps}>
      <Alert.Icon mt="1" />
      <Box ml="2">
        <Text variant="subtitle2">{title}</Text>
        {description && <Text variant="body2">{description}</Text>}
      </Box>
    </Alert>
  );
};

export default ToastAlert;
