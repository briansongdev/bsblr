import "../styles.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

const theme = createTheme({
  typography: {
    fontFamily: "ibm-plex-sans",
    // button: {
    //   fontFamily: "Roboto",
    // },
  },
  palette: {
    // primary: {
    //   // main: "#fb8c00",
    //   main: "#ffcd38",
    // },
    // secondary: {
    //   main: "#f73378",
    // },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      {" "}
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
