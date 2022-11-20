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
        h2: {
          fontSize: 40,
          fontWeight: 700,
        },
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
      defaultProps: {
        selectionColor: "#2432FF",
        p: 0,
        size: "2xl",
        borderWidth: 0,
      },
      baseStyle: {
        color: "white",
      },
    },
    Button: {
      defaultProps: {
        _text: {
          fontWeight: 600,
          fontSize: "md",
        },
      },
      baseStyle: {
        rounded: "full",
      },
      variants: {
        solid: {
          bgColor: "#2432FF",
          _pressed: {
            opacity: 0.8,
          },
          _disabled: {
            opacity: 1,
            _text: {
              opacity: 0.4,
            },
          },
          _loading: {
            opacity: 0.8,
            h: 47.2,
          },
        },
        subtle: {
          bgColor: "gray.800",
          _text: {
            color: "white",
          },
          _pressed: {
            bgColor: "gray.700",
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
