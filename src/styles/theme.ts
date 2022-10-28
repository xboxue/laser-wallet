import { extendTheme } from "native-base";

const theme = extendTheme({
  useSystemColorMode: false,
  initialColorMode: "dark",
  components: {
    Text: {
      baseStyle: {
        color: "white",
      },
      variants: {
        h3: {
          fontSize: "3xl",
          fontWeight: 700,
        },
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
    IconButton: {
      defaultProps: {
        colorScheme: "coolGray",
        _pressed: {
          bgColor: "gray.200",
        },
      },
    },
    Input: {
      baseStyle: {
        bgColor: "gray.800",
        color: "white",
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "3",
      },
      variants: {
        solid: {
          bgColor: "gray.800",
          _pressed: {
            opacity: 0.8,
          },
        },
        subtle: {
          bgColor: "gray.100",
          _pressed: {
            bgColor: "gray.200",
          },
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
