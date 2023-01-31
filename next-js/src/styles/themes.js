import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const styles = {
  global: (props) => ({
    body: {
      color: mode("blackAlpha.800", "blackAlpha.800")(props),
      bg: mode("#ebebeb", "##ebebeb")(props),
    },
  }),
};

export const theme = extendTheme({
  styles,
  fonts: {
    heading: `'Montserrat', sans-serif`,
  },
  colors: {
    primary: {
      main: "#98856e",
      200: "#d6deeb",
      300: "#98856e",
      400: "#92847b",
      500: "#7f6a5e",
    },
  },
});
