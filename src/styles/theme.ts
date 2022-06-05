import { extendTheme } from "native-base";

const theme = extendTheme({
  components: {
    Text: {
      variants: {
        h4: {
          fontSize: "2xl",
          fontWeight: 700,
        },
        h5: {
          fontSize: "xl",
          fontWeight: 600,
        },
        h6: {
          fontSize: "lg",
          fontWeight: 500,
        },
        body1: {
          fontSize: "md",
        },
        body2: {
          fontSize: "sm",
        },
        subtitle1: {
          fontSize: "md",
          fontWeight: 600,
        },
        subtitle2: {
          fontSize: "sm",
          fontWeight: 500,
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "3",
      },
      variants: {
        solid: {
          bgColor: "#319795",
        },
      },
    },
  },
  fontConfig: {
    Inter: {
      400: { normal: "Inter_400Regular" },
      500: { normal: "Inter_500Medium" },
      600: { normal: "Inter_600SemiBold" },
      700: { normal: "Inter_700Bold" },
    },
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "Inter",
  },
});

export default theme;
