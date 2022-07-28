import { signIn } from "next-auth/react";
import Head from "next/head";
import clientPromise from "../lib/mongodb";
import { getSession } from "next-auth/react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [errorContent, setErrorContent] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password,
    }).then((e) => {
      if (e.ok) {
        router.push("/");
      } else {
        setErrorContent(e.error);
      }
    });
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isDisabled = email === "" || password === "";
  return (
    <Container>
      <Head>
        <title>Login to BSBLR</title>
      </Head>
      <h1 style={{ fontWeight: "300" }}>Login to BSBLR</h1>
      <Grid justify="center" alignItems="center">
        <form onSubmit={handleSubmit}>
          <Grid item>
            <TextField
              label="Email address"
              variant="outlined"
              onChange={(v) => setEmail(v.target.value)}
              helperText="The email you signed up with."
              style={{ width: "100%" }}
            />
          </Grid>
          <br />
          <Grid item>
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              onChange={(v) => setPassword(v.target.value)}
              helperText="Enter your password."
              style={{ width: "100%" }}
            />
          </Grid>
          <br />
          {errorContent && errorContent != "" ? (
            <>
              <Alert severity="error">{errorContent}</Alert>
              <br />
            </>
          ) : (
            <></>
          )}
          <Button
            variant="contained"
            type="submit"
            disabled={isDisabled}
            color="primary"
            style={{ width: "100%", height: "50px" }}
          >
            Submit
          </Button>
        </form>
      </Grid>
      <br />
    </Container>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  try {
    await clientPromise;
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}
