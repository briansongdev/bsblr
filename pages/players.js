import Head from "next/head";
import Link from "next/link";
import clientPromise from "../lib/mongodb";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {
  Stack,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/router";

export default function Home({ isConnected }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [messagee, setMessagee] = useState("");
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [currentlySelectedPlayer, setCurrentPlayer] = useState({});
  const [currentlySelectedHitter, setCurrentHitter] = useState({});
  const [currentlySelectedHitterInd, setCurrentHitterInd] = useState(-1);

  const handleClose = async () => {
    await axios.post("/api/setPitcher", {
      email: userInfo.email,
      password: userInfo.password,
      pitcherToChange: JSON.stringify(currentlySelectedPlayer),
    });
    const data = await axios
      .get("/api/auth/account", {
        headers: {
          uid: session.user.name,
        },
      })
      .then((res) => {
        res.data.players.sort((a, b) => {
          let totalSumA = a.pitchCom + a.fieldCom + a.strength,
            totalSumB = b.pitchCom + b.fieldCom + b.strength;
          return totalSumA > totalSumB ? -1 : 1;
        });
        setUserInfo(res.data);
        setCurrentPlayer(res.data.currPitcher);
        if (res.data.currentMatch != "") router.push("/game");
      });
    setOpen(false);
  };
  const handleClose1 = async () => {
    await axios.post("/api/setHitter", {
      email: userInfo.email,
      password: userInfo.password,
      hitterToChange: JSON.stringify(currentlySelectedHitter),
      hitterIndex: currentlySelectedHitterInd,
    });
    const data = await axios
      .get("/api/auth/account", {
        headers: {
          uid: session.user.name,
        },
      })
      .then((res) => {
        res.data.players.sort((a, b) => {
          let totalSumA = a.pitchCom + a.fieldCom + a.strength,
            totalSumB = b.pitchCom + b.fieldCom + b.strength;
          return totalSumA > totalSumB ? -1 : 1;
        });
        setUserInfo(res.data);
        setCurrentHitter({});
        setCurrentHitterInd(-1);
        if (res.data.currentMatch != "") router.push("/game");
      });
    setOpen1(false);
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
          res.data.players.sort((a, b) => {
            let totalSumA = a.pitchCom + a.fieldCom + a.strength,
              totalSumB = b.pitchCom + b.fieldCom + b.strength;
            return totalSumA > totalSumB ? -1 : 1;
          });
          setUserInfo(res.data);
          setLoading(false);
          setCurrentPlayer(res.data.currPitcher);
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
            alignItems="center"
            sx={{ mt: 2 }}
            spacing={1}
          >
            <Grid item xs={3}>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h4" textAlign="center" gutterBottom>
                    Pitcher
                  </Typography>
                </Grid>
                <Grid item>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography sx={{ mb: 1.5 }}>
                        <strong>{userInfo.currPitcher.name}</strong>
                      </Typography>
                      <Typography>
                        Pitching:{" "}
                        {userInfo.currPitcher.pitchCom >= 25 ? (
                          <span id="fire-text">
                            {userInfo.currPitcher.pitchCom}
                          </span>
                        ) : (
                          <>{userInfo.currPitcher.pitchCom}</>
                        )}
                      </Typography>
                      <Typography>
                        Fielding score:
                        {userInfo.currPitcher.fieldCom >= 25 ? (
                          <span id="fire-text">
                            {" "}
                            {userInfo.currPitcher.fieldCom}
                          </span>
                        ) : (
                          <> {userInfo.currPitcher.fieldCom}</>
                        )}
                      </Typography>
                      <Typography>
                        Strength:{" "}
                        {userInfo.currPitcher.strength >= 25 ? (
                          <span id="fire-text">
                            {" "}
                            {userInfo.currPitcher.strength}
                          </span>
                        ) : (
                          <> {userInfo.currPitcher.strength}</>
                        )}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        onClick={() => {
                          setOpen(true);
                        }}
                      >
                        Change Pitcher
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="h4" textAlign="center" gutterBottom>
                Lineup
              </Typography>
              <Container>
                <Carousel
                  arrows
                  autoPlay={false}
                  infinite={false}
                  swipeable={false}
                  draggable={false}
                  responsive={{
                    desktop: {
                      breakpoint: {
                        max: 3000,
                        min: 1024,
                      },
                      items: 3,
                      partialVisibilityGutter: 40,
                    },
                    mobile: {
                      breakpoint: {
                        max: 464,
                        min: 0,
                      },
                      items: 1,
                      partialVisibilityGutter: 30,
                    },
                    tablet: {
                      breakpoint: {
                        max: 1024,
                        min: 464,
                      },
                      items: 2,
                      partialVisibilityGutter: 30,
                    },
                  }}
                  showDots={false}
                  slidesToSlide={1}
                >
                  {userInfo.lineup.slice().map((d, ind) => {
                    return (
                      <Card
                        variant="outlined"
                        style={{ margin: "5px 5px 5px 5px" }}
                      >
                        <CardContent>
                          <Typography sx={{ mb: 1.5 }}>
                            <strong>
                              #{ind + 1}: {d.name} - {d.position}
                            </strong>
                          </Typography>
                          {d.position == "P" ? (
                            <Typography>
                              Pitching:{" "}
                              {d.pitchCom >= 25 ? (
                                <span id="fire-text">{d.pitchCom}</span>
                              ) : (
                                <>{d.pitchCom}</>
                              )}
                            </Typography>
                          ) : (
                            <Typography>Pitching: N/A</Typography>
                          )}
                          <Typography>
                            Fielding score:
                            {d.fieldCom >= 25 ? (
                              <span id="fire-text"> {d.fieldCom}</span>
                            ) : (
                              <> {d.fieldCom}</>
                            )}
                          </Typography>
                          <Typography>
                            Strength:{" "}
                            {d.strength >= 25 ? (
                              <span id="fire-text"> {d.strength}</span>
                            ) : (
                              <> {d.strength}</>
                            )}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            onClick={() => {
                              setOpen1(true);
                              setCurrentHitter(d);
                              setCurrentHitterInd(ind);
                            }}
                          >
                            Change #{ind + 1} player
                          </Button>
                        </CardActions>
                      </Card>
                    );
                  })}
                </Carousel>
              </Container>
            </Grid>
          </Grid>

          <Typography variant="h4" textAlign="center" gutterBottom>
            Inactive Players
          </Typography>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            {userInfo.players.map((d) => {
              if (
                !userInfo.lineup
                  .map((s) => JSON.stringify(s))
                  .some((s) => s == JSON.stringify(d)) &&
                !(JSON.stringify(userInfo.currPitcher) == JSON.stringify(d))
              ) {
                return (
                  <Grid item>
                    <Card
                      variant="outlined"
                      style={{ margin: "5px 5px 5px 5px" }}
                    >
                      <CardContent>
                        <Typography sx={{ mb: 1.5 }}>
                          <strong>
                            {d.name} - {d.position}
                          </strong>
                        </Typography>
                        {d.position == "P" ? (
                          <Typography>
                            Pitching:{" "}
                            {d.pitchCom >= 25 ? (
                              <span id="fire-text">{d.pitchCom}</span>
                            ) : (
                              <>{d.pitchCom}</>
                            )}
                          </Typography>
                        ) : (
                          <Typography>Pitching: N/A</Typography>
                        )}
                        <Typography>
                          Fielding score:
                          {d.fieldCom >= 25 ? (
                            <span id="fire-text"> {d.fieldCom}</span>
                          ) : (
                            <> {d.fieldCom}</>
                          )}
                        </Typography>
                        <Typography>
                          Strength:{" "}
                          {d.strength >= 25 ? (
                            <span id="fire-text"> {d.strength}</span>
                          ) : (
                            <> {d.strength}</>
                          )}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          onClick={async () => {
                            await axios
                              .post("/api/removePlayer", {
                                email: userInfo.email,
                                password: userInfo.password,
                                playerToRemove: JSON.stringify(d),
                              })
                              .then((el) => setMessagee(el.data.message));
                            setTimeout(() => setMessagee(""), 5000);
                            await axios
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
                          Retire
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              } else {
                return <></>;
              }
            })}
          </Grid>
          {messagee != "" ? (
            <Alert severity="success">{messagee}</Alert>
          ) : (
            <></>
          )}
        </Container>
        <Dialog open={open}>
          <DialogTitle>Change Current Pitcher</DialogTitle>
          <DialogContent
            sx={{ textAlign: "center", justifyContent: "content" }}
          >
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              {userInfo.players.map((d) => {
                if (d.position == "P") {
                  return (
                    <Grid item>
                      <Paper
                        elevation={1}
                        style={{
                          width: "200px",
                          overflow: "auto",
                          margin: "5px 5px 5px 5px",
                        }}
                      >
                        <IconButton
                          sx={{
                            borderRadius: 0,
                            width: "100%",
                            height: "100%",
                          }}
                          color={
                            JSON.stringify(d) ==
                            JSON.stringify(currentlySelectedPlayer)
                              ? "primary"
                              : "inherit"
                          }
                          onClick={() => {
                            setCurrentPlayer(d);
                          }}
                        >
                          <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Grid item>
                              <Typography sx={{ mb: 1.5 }}>
                                <strong>
                                  {d.name} - {d.position}
                                </strong>
                              </Typography>
                            </Grid>
                            <Grid item>
                              {d.position == "P" ? (
                                <Typography>
                                  Pitching:{" "}
                                  {d.pitchCom >= 25 ? (
                                    <span id="fire-text">{d.pitchCom}</span>
                                  ) : (
                                    <>{d.pitchCom}</>
                                  )}
                                </Typography>
                              ) : (
                                <Typography>Pitching: N/A</Typography>
                              )}
                            </Grid>
                            <Grid item>
                              <Typography>
                                Fielding score:
                                {d.fieldCom >= 25 ? (
                                  <span id="fire-text"> {d.fieldCom}</span>
                                ) : (
                                  <> {d.fieldCom}</>
                                )}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography>
                                Strength:{" "}
                                {d.strength >= 25 ? (
                                  <span id="fire-text"> {d.strength}</span>
                                ) : (
                                  <> {d.strength}</>
                                )}
                              </Typography>
                            </Grid>{" "}
                          </Grid>
                        </IconButton>
                      </Paper>
                    </Grid>
                  );
                }
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Select</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={open1}>
          <DialogTitle>Change Current Hitter</DialogTitle>
          <DialogContent
            sx={{ textAlign: "center", justifyContent: "content" }}
          >
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              {userInfo.players.map((d) => {
                if (
                  !userInfo.lineup
                    .map((s) => JSON.stringify(s))
                    .some((s) => s == JSON.stringify(d))
                ) {
                  return (
                    <Grid item>
                      <Paper
                        elevation={1}
                        style={{
                          width: "200px",
                          overflow: "auto",
                          margin: "5px 5px 5px 5px",
                        }}
                      >
                        <IconButton
                          sx={{
                            borderRadius: 0,
                            width: "100%",
                            height: "100%",
                          }}
                          color={
                            JSON.stringify(d) ==
                            JSON.stringify(currentlySelectedHitter)
                              ? "primary"
                              : "inherit"
                          }
                          onClick={() => {
                            setCurrentHitter(d);
                          }}
                        >
                          <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Grid item>
                              <Typography sx={{ mb: 1.5 }}>
                                <strong>
                                  {d.name} - {d.position}
                                </strong>
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography>
                                Fielding score:
                                {d.fieldCom >= 25 ? (
                                  <span id="fire-text"> {d.fieldCom}</span>
                                ) : (
                                  <> {d.fieldCom}</>
                                )}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography>
                                Strength:{" "}
                                {d.strength >= 25 ? (
                                  <span id="fire-text"> {d.strength}</span>
                                ) : (
                                  <> {d.strength}</>
                                )}
                              </Typography>
                            </Grid>{" "}
                          </Grid>
                        </IconButton>
                      </Paper>
                    </Grid>
                  );
                }
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose1}>Select</Button>
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
