import Head from "next/head";
import clientPromise from "../lib/mongodb";
import { getSession, useSession } from "next-auth/react";
import { useEffect } from "react";
import axios from "axios";
import { router, useRouter } from "next/router";

export default function Game({ isConnected }) {
  const session = useSession();
  const router = useRouter();
  if (session.status == "loading") {
    return <div>Loading</div>;
  } else {
    let currentMatch = "";
    axios
      .get("/api/auth/account", {
        headers: {
          uid: session.data.user.name,
        },
      })
      .then((res) => {
        if (res.data.currentMatch == "") {
          router.push("/");
        }
        currentMatch = res.data.currentMatch;
      });
    if (currentMatch != "") {
      return (
        <>
          <Head>
            <title>BSBLR - Game</title>
          </Head>
          <Container>
            <Typography variant="h1">Hi</Typography>
          </Container>
        </>
      );
    } else {
      return <div>Loading</div>;
    }
  }
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) {
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
