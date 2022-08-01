import Head from "next/head";
import Link from "next/link";
import clientPromise from "../lib/mongodb";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import MovingComponent from "react-moving-text";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TextField,
  Tooltip,
  Alert,
  Paper,
} from "@mui/material";
import { useRouter } from "next/router";

export default function Home({ isConnected }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSelected, setSelected] = useState(true);
  const [isSelected1, setSelected1] = useState(false);

  const [isDiaOpen1, setDiaOpen1] = useState(false);
  const [isDiaOpen2, setDiaOpen2] = useState(false);

  const [newPlayer1, setPlayer1] = useState({});
  const [newPlayer2, setPlayer2] = useState({});

  const handleClose1 = async () => {
    const data = await axios
      .get("/api/auth/account", {
        headers: {
          uid: session.user.name,
        },
      })
      .then((res) => {
        setUserInfo(res.data);
        if (res.data.currentMatch != "") router.push("/game");
      });
    setDiaOpen1(false);
    setPlayer1({});
  };

  const handleClose2 = async () => {
    const data = await axios
      .get("/api/auth/account", {
        headers: {
          uid: session.user.name,
        },
      })
      .then((res) => {
        setUserInfo(res.data);
        if (res.data.currentMatch != "") router.push("/game");
      });
    setDiaOpen2(false);
    setPlayer2({});
  };

  const loading = status === "loading";
  useEffect(() => {
    const getAcc = async () => {
      const data = await axios
        .get("/api/auth/account", {
          headers: {
            uid: session.user.name,
          },
        })
        .then((res) => {
          setUserInfo(res.data);
          setLoading(false);
          if (res.data.currentMatch != "") router.push("/game");
        });
    };
    getAcc().catch((e) => {
      console.log(e);
    });
  }, [session]);
  if (loading) {
    return (
      <>
        <Head>
          <title>BSBLR</title>
        </Head>
        <Container>
          {" "}
          <Typography variant="h3">BSBLR</Typography>
        </Container>
      </>
    );
  } else if (!session && !loading && isLoading) {
    return (
      <>
        {" "}
        <Head>
          <title>BSBLR</title>
        </Head>
        <Container>
          <Typography variant="h3">BSBLR</Typography>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
            spacing={2}
          >
            <Grid item>
              <Typography variant="h4">Up for a little baseball?</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5">
                The first-ever browser interactive PvP baseball game.
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="text.secondary">Easy to learn.</Typography>
            </Grid>
            <Grid item>
              <Typography color="text.secondary">
                Engaging and realistic, with full 9-inning games.
              </Typography>
            </Grid>
            <Grid item>
              <Typography color="text.secondary">
                Competitive, with ranks to climb and recognitions to reap.
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5">Play ball!</Typography>
            </Grid>
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="space-around"
                alignItems="center"
                spacing={3}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    style={{ width: "200px" }}
                    onClick={() => router.push("/signup")}
                  >
                    Signup
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    style={{ width: "200px" }}
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </>
    );
  }
  if (session && !isLoading && userInfo) {
    return (
      <>
        <Head>
          <title>BSBLR</title>
        </Head>
        <Container>
          <Typography
            variant="h3"
            style={{ cursor: "pointer", width: "max-content" }}
            onClick={() => router.push("/")}
          >
            BSBLR
          </Typography>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            sx={{ mt: 2 }}
          >
            <Grid item xs={3}>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
              >
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        variant="h5"
                        gutterBottom
                      >
                        My currencies
                      </Typography>
                      <Typography variant="h5">
                        Level: {Math.floor(userInfo.exp / 1000)}
                      </Typography>
                      <Typography variant="h5">
                        Tickets: {userInfo.tickets}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => {
                          router.push("/players");
                        }}
                      >
                        Manage Players
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          signOut();
                        }}
                      >
                        Sign out
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>{" "}
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography
                        variant="h5"
                        component="div"
                        color="text.secondary"
                      >
                        Level Milestones
                      </Typography>
                      <Typography>...</Typography>
                      {userInfo.levelRewards
                        .sort((a, b) => (a.level > b.level ? 1 : -1))
                        .map((d, index) => {
                          if (
                            Math.floor(userInfo.exp / 1000) - (index + 1) <=
                              5 &&
                            index + 1 <= Math.floor(userInfo.exp / 1000)
                          ) {
                            return (
                              <Typography>
                                Level {d.level} -{" "}
                                {d.claimed ? (
                                  <span style={{ color: "grey" }}>
                                    Rewards claimed
                                  </span>
                                ) : (
                                  <span style={{ color: "grey" }}>
                                    Not claimed yet{" "}
                                  </span>
                                )}
                              </Typography>
                            );
                          }
                        })}
                      <Typography>...</Typography>
                      <Typography>
                        You may have unclaimed tickets from past milestones.
                      </Typography>
                      <Button
                        sx={{ width: "100%", mt: 1 }}
                        variant="contained"
                        onClick={async () => {
                          await axios
                            .post("/api/claim", {
                              email: userInfo.email,
                              password: userInfo.password,
                            })
                            .then((ul) => {
                              setMessage(ul.data.message);
                            });
                          const data = await axios
                            .get("/api/auth/account", {
                              headers: {
                                uid: session.user.name,
                              },
                            })
                            .then((res) => {
                              setUserInfo(res.data);
                              if (res.data.currentMatch != "")
                                router.push("/game");
                            });
                        }}
                      >
                        Claim
                      </Button>
                      {message != "" ? (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          {message}
                        </Alert>
                      ) : (
                        <></>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="h4" textAlign="center">
                Acquire New Players
              </Typography>
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <Paper
                    elevation={3}
                    style={{
                      width: "250px",
                      overflow: "auto",
                      height: "100px",
                      margin: "15px 15px 15px 15px",
                    }}
                  >
                    <IconButton
                      sx={{ borderRadius: 0, width: "100%", height: "100%" }}
                      color={isSelected ? "primary" : "inherit"}
                      onClick={() => {
                        setSelected(true);
                        setSelected1(false);
                      }}
                    >
                      <Typography
                        variant="h5"
                        style={{ padding: "10px 10px 10px 10px" }}
                      >
                        <strong>Normal Pool</strong>
                      </Typography>
                    </IconButton>
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper
                    elevation={3}
                    style={{
                      width: "250px",
                      overflow: "auto",
                      height: "100px",
                      margin: "15px 15px 15px 15px",
                    }}
                  >
                    <IconButton
                      sx={{ borderRadius: 0, width: "100%", height: "100%" }}
                      color={isSelected1 ? "primary" : "inherit"}
                      onClick={() => {
                        setSelected1(true);
                        setSelected(false);
                      }}
                    >
                      <Typography
                        variant="h5"
                        style={{ padding: "10px 10px 10px 10px" }}
                      >
                        <strong>Special Pool</strong>
                      </Typography>
                    </IconButton>
                  </Paper>
                </Grid>
              </Grid>
              {isSelected ? (
                <>
                  <Typography>
                    Acquire players from the <strong>normal pool</strong>.
                  </Typography>
                  <Typography>
                    <br />
                    <strong>Probabilities:</strong>
                    <br /> Pitcher (33%) - Fielder (66%)
                    <br />
                    <br />
                    <strong>Rarities:</strong>
                    <br />
                    Draftee (80%): base stats will range 7 to 13, determined
                    randomly
                    <br />
                    Prospect (15%): base stats will range 10 to 16, determined
                    randomly
                    <br />
                    Major-leaguer (4%): base stats will range 19 to 25,
                    determined randomly
                    <br />
                    Exotic (1%): base stats will range from 30 to 36, determined
                    randomly
                  </Typography>
                  <Button
                    sx={{ width: "100%", height: "50px", mt: 2 }}
                    variant="contained"
                    onClick={async () => {
                      if (
                        confirm(
                          "Are you sure you want to normal-acquire a player?"
                        )
                      ) {
                        setDiaOpen1(true);
                        await axios
                          .post("/api/acquire", {
                            email: userInfo.email,
                            password: userInfo.password,
                            isNormal: true,
                          })
                          .then((result) => {
                            setTimeout(() => setPlayer1(result.data), 3000);
                          });
                      }
                    }}
                    disabled={userInfo.tickets < 20}
                  >
                    Acquire
                  </Button>
                  <Typography variant="overline">
                    1 acquisition = 20 tickets
                  </Typography>
                </>
              ) : (
                <></>
              )}
              {isSelected1 ? (
                <>
                  {" "}
                  <Typography>
                    Acquire players from the <strong>special pool</strong>: a
                    chance to obtain specialist players!
                  </Typography>
                  <Typography>
                    <br />
                    <strong>Probabilities:</strong>
                    <br /> Pitcher (50%) - Fielder (50%)
                    <br />
                    <br />
                    <strong>Types of specialist pitchers:</strong>
                    <br />
                    Mind Controller (50%): top-heavy on pitching control, lower
                    in strength and fielding. Gives opponent a greater range to
                    guess your velocity in. Control 35 to 40, Strength 5 to 10,
                    Fielding 5 to 10.
                    <br />
                    Glass Cannon (50%): top-heavy on strength, lower in pitching
                    control and fielding. Greater strength gives opponent lower
                    overall probability of recording a hit. Control 10 to 15,
                    Strength 30 to 35, Fielding 5 to 10.
                    <br />
                    <br />
                    <strong>Types of specialist fielders:</strong>
                    <br />
                    Defensive Whiz (50%): top-heavy on fielding score, lower in
                    batting. Useful for getting extra outs on the field.
                    Strength 10 to 15, Fielding 30 to 35.
                    <br />
                    Platinum Slugger (50%): top-heavy on strength, lower in
                    field. Useful for slugging big. Strength 30 to 35, Fielding
                    10 to 15.
                  </Typography>
                  <Button
                    sx={{ width: "100%", height: "50px", mt: 2 }}
                    variant="contained"
                    onClick={async () => {
                      if (
                        confirm(
                          "Are you sure you want to special-acquire a player?"
                        )
                      ) {
                        setDiaOpen2(true);
                        await axios
                          .post("/api/acquire", {
                            email: userInfo.email,
                            password: userInfo.password,
                            isNormal: false,
                          })
                          .then((result) => {
                            setTimeout(() => setPlayer2(result.data), 3000);
                          });
                      }
                    }}
                    disabled={userInfo.tickets < 50}
                  >
                    Acquire
                  </Button>
                  <Typography variant="overline">
                    1 acquisition = 50 tickets
                  </Typography>
                </>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </Container>
        <Dialog open={isDiaOpen1}>
          <DialogTitle>
            {" "}
            <MovingComponent
              type="shakeMix"
              duration="750ms"
              delay="0s"
              direction="normal"
              timing="ease"
              iteration="5"
              fillMode="none"
              id="vibrantIcon"
            >
              Someone's here to meet you!!
            </MovingComponent>
          </DialogTitle>
          <DialogContent
            sx={{
              textAlign: "center",
              justifyContent: "content",
              width: "500px",
            }}
          >
            {Object.keys(newPlayer1).length == 0 ? (
              <CircularProgress color="secondary" />
            ) : (
              <>
                {" "}
                <Box
                  component="img"
                  sx={{
                    height: 85,
                    borderRadius: "50%",
                    border: 10,
                  }}
                  src="silhouette.png"
                />
                <Typography variant="h4" id="vibrantIcon">
                  <strong>{newPlayer1.name}</strong> {newPlayer1.position}
                </Typography>
                {newPlayer1.position == "P" ? (
                  <Typography>
                    Pitching control:{" "}
                    {newPlayer1.pitchCom >= 25 ? (
                      <span id="fire-text">{newPlayer1.pitchCom}</span>
                    ) : (
                      <>{newPlayer1.pitchCom}</>
                    )}
                  </Typography>
                ) : (
                  <></>
                )}
                <Typography>
                  Fielding score:
                  {newPlayer1.fieldCom >= 25 ? (
                    <span id="fire-text"> {newPlayer1.fieldCom}</span>
                  ) : (
                    <> {newPlayer1.fieldCom}</>
                  )}
                </Typography>
                <Typography>
                  Strength:{" "}
                  {newPlayer1.strength >= 25 ? (
                    <span id="fire-text"> {newPlayer1.strength}</span>
                  ) : (
                    <> {newPlayer1.strength}</>
                  )}
                  <br />
                  <br />
                </Typography>
                <Typography>
                  Congrats on acquiring a new player! You'll do great things
                  together.
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose1}>Done</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isDiaOpen2}>
          <DialogTitle>
            {" "}
            <MovingComponent
              type="shakeMix"
              duration="750ms"
              delay="0s"
              direction="normal"
              timing="ease"
              iteration="5"
              fillMode="none"
              id="specialPlayerIcon"
            >
              Someone special's here to meet you!!
            </MovingComponent>
          </DialogTitle>
          <DialogContent
            sx={{
              textAlign: "center",
              justifyContent: "content",
              width: "500px",
            }}
          >
            {Object.keys(newPlayer2).length == 0 ? (
              <CircularProgress color="secondary" />
            ) : (
              <>
                {" "}
                <Box
                  component="img"
                  sx={{
                    height: 85,
                    borderRadius: "50%",
                    border: 10,
                  }}
                  src="silhouette.png"
                />
                <Typography variant="h4" id="vibrantIcon">
                  <strong>{newPlayer2.name}</strong> {newPlayer2.position}
                </Typography>
                {newPlayer2.position == "P" ? (
                  <Typography>
                    Pitching control:{" "}
                    {newPlayer2.pitchCom >= 25 ? (
                      <span id="fire-text">{newPlayer2.pitchCom}</span>
                    ) : (
                      <>{newPlayer2.pitchCom}</>
                    )}
                  </Typography>
                ) : (
                  <></>
                )}
                <Typography>
                  Fielding score:
                  {newPlayer2.fieldCom >= 25 ? (
                    <span id="fire-text"> {newPlayer2.fieldCom}</span>
                  ) : (
                    <> {newPlayer2.fieldCom}</>
                  )}
                </Typography>
                <Typography>
                  Strength:{" "}
                  {newPlayer2.strength >= 25 ? (
                    <span id="fire-text"> {newPlayer2.strength}</span>
                  ) : (
                    <> {newPlayer2.strength}</>
                  )}
                  <br />
                  <br />
                </Typography>
                <Typography>
                  Congrats on acquiring a specialist! You'll do great things
                  together.
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose2}>Done</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export async function getServerSideProps(context) {
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
