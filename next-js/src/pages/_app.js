import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthContextProvider } from "store/auth-context";
import { theme } from "@/styles/themes";
import Header from "components/Header";

export default function App({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ChakraProvider theme={theme}>
        <Header>
          <Component {...pageProps} />
        </Header>
      </ChakraProvider>
    </AuthContextProvider>
  );
}
