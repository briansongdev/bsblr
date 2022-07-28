import Head from "next/head";
import clientPromise from "../lib/mongodb";
import { getSession, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function Game({ isConnected }) {
  const [currentMatch, setCurrentM] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [gameInfo, setGameInfo] = useState({});
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session != undefined) {
      axios
        .get("/api/auth/account", {
          headers: {
            uid: session.user.name,
          },
        })
        .then((res) => {
          if (res.data.currentMatch == "") {
            router.push("/");
          }
          setCurrentM(res.data.currentMatch);
          if (Object.keys(userInfo).length === 0) {
            setUserInfo(res.data);
          }
        });
      axios
        .get("/api/game", {
          headers: {
            email: userInfo.email,
            password: userInfo.password,
            gameid: currentMatch,
          },
        })
        .then((res) => {
          setGameInfo(res.data);
        });
    }
  }, [session && userInfo]);
  if (session != undefined) {
    if (currentMatch != "") {
      return (
        <>
          <Head>
            <title>BSBLR - Game</title>
          </Head>
          <Container>
            <Typography variant="h3">BSBLR</Typography>
            <Typography>
              {gameInfo.isRanked ? "Ranked game" : "Unranked game"}
            </Typography>

            <Card
              style={{ width: "100%", marginTop: "20px" }}
              variant="outlined"
            >
              {" "}
              <CardContent
                sx={{ justifyContent: "center", textAlign: "center" }}
              >
                <Typography variant="h4">
                  <span style={{ fontWeight: "bold" }}>{gameInfo.player1}</span>{" "}
                  vs.{" "}
                  <span style={{ fontWeight: "bold" }}>{gameInfo.player2}</span>
                </Typography>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                  spacing={4}
                >
                  <Grid item>
                    <Typography variant="h4" color="text.secondary">
                      {gameInfo.p1runs}
                    </Typography>
                  </Grid>
                  <Grid item>
                    {" "}
                    {gameInfo.isTopInning ? (
                      <Typography variant="h4" color="text.secondary">
                        <ArrowDropUpIcon />
                        {gameInfo.currentInning}
                      </Typography>
                    ) : (
                      <Typography variant="h4" color="text.secondary">
                        <ArrowDropDownIcon />
                        {gameInfo.currentInning}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item>
                    {" "}
                    <Typography variant="h4" color="text.secondary">
                      {gameInfo.p2runs}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Container>
        </>
      );
    } else {
      return <div>Loading</div>;
    }
  } else return <div>Loading</div>;
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
