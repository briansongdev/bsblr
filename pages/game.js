import Head from "next/head";
import clientPromise from "../lib/mongodb";
import { getSession, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Howl } from "howler";
import axios from "axios";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TimerIcon from "@mui/icons-material/Timer";

export default function Game({ isConnected }) {
  const [currentMatch, setCurrentM] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [gameInfo, setGameInfo] = useState({});
  const [timer, setTimer] = useState(-1);
  const [currentGuess, setGuess] = useState(-1);
  const [message, setMessage] = useState("");
  const [rank1, updateRank1] = useState({ name: "", color: "grey" });
  const [rank2, updateRank2] = useState({ name: "", color: "grey" });
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
        .then(async (res) => {
          if (res.data.currentMatch == "") {
            router.push("/");
          }
          setCurrentM(res.data.currentMatch);
          let currGame;
          if (Object.keys(userInfo).length === 0) {
            setUserInfo(res.data);
            await axios
              .get("/api/game", {
                headers: {
                  email: res.data.email,
                  password: res.data.password,
                  gameid: res.data.currentMatch,
                },
              })
              .then(async (res1) => {
                await axios
                  .post("/api/rank", {
                    usern: res1.data.player1,
                  })
                  .then((rank1) => {
                    updateRank1(rank1.data);
                  });
                await axios
                  .post("/api/rank", {
                    usern: res1.data.player2,
                  })
                  .then((rank1) => {
                    updateRank2(rank1.data);
                  });
                setGameInfo(res1.data);
                currGame = res1.data;
              });
            let myInt = setInterval(async () => {
              if (res.data.currentMatch == "") {
                clearInterval(myInt);
                router.push("/");
              }
              let otherAFK = false;
              await axios
                .get("/api/game", {
                  headers: {
                    email: res.data.email,
                    password: res.data.password,
                    gameid: res.data.currentMatch,
                  },
                })
                .then(async (res1) => {
                  if (JSON.stringify(res1.data) == JSON.stringify(currGame)) {
                    otherAFK = true;
                  }
                  setGameInfo(res1.data);
                  currGame = res1.data;
                  setTimer(res1.data.countdown);
                  if (res.data.username == res1.data.player1 || otherAFK) {
                    // subtract 1 to time every second
                    await axios.post("/api/time", {
                      email: res.data.email,
                      password: res.data.password,
                      gameid: res.data.currentMatch,
                    });
                  }
                  if (otherAFK) {
                    await axios
                      .get("/api/game", {
                        headers: {
                          email: res.data.email,
                          password: res.data.password,
                          gameid: res.data.currentMatch,
                        },
                      })
                      .then((sdadla) => {
                        setTimer(sdadla.data.countdown);
                      });
                  }
                  await axios
                    .get("/api/auth/account", {
                      headers: {
                        uid: session.user.name,
                      },
                    })
                    .then((res2) => {
                      if (res2.data.currentMatch == "") {
                        clearInterval(myInt);
                        router.push("/");
                      }
                    });
                  if (res1.data.countdown == 0) {
                    let sound1 = new Howl({
                      src: [
                        "https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.mp3",
                      ],
                      html5: true,
                      volume: 0.1,
                    });
                    sound1.play();
                    setDisabled(false);
                    setGuess(-1);
                    setMessage("");
                    await axios
                      .get("/api/game", {
                        headers: {
                          email: res.data.email,
                          password: res.data.password,
                          gameid: res.data.currentMatch,
                        },
                      })
                      .then(async (res3) => {
                        setGameInfo(res3.data);
                      });
                  }
                });
            }, 1000);
          }
        });
    }
  }, [session && userInfo]);
  if (session != undefined) {
    if (
      currentMatch != "" &&
      Object.keys(gameInfo).length > 0 &&
      Object.keys(userInfo).length > 0
    ) {
      return (
        <>
          <Head>
            <title>BSBLR - Game</title>
          </Head>
          <Container>
            <Typography variant="h3">BSBLR</Typography>
            <Typography gutterBottom>
              {gameInfo.isRanked ? "Ranked game" : "Unranked game"}{" "}
            </Typography>
            <Card
              style={{
                width: "100%",
                marginTop: "20px",
                marginBottom: "20px",
              }}
              variant="outlined"
            >
              {" "}
              <CardContent
                sx={{ justifyContent: "center", textAlign: "center" }}
              >
                <Grid
                  container
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                  spacing={3}
                >
                  <Grid item>
                    <Typography
                      id={rank1.color}
                      style={{ color: rank1.color }}
                      variant="h4"
                    >
                      {gameInfo.player1}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4" color="text.secondary">
                      {gameInfo.p1runs}
                    </Typography>
                  </Grid>
                  <Grid item>
                    {" "}
                    {gameInfo.isTopInning ? (
                      <Typography variant="h5">
                        <ArrowDropUpIcon />
                        {gameInfo.currentInning}
                      </Typography>
                    ) : (
                      <Typography variant="h5">
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
                  <Grid item>
                    <Typography
                      id={rank2.color}
                      style={{ color: rank2.color }}
                      variant="h4"
                    >
                      {gameInfo.player2}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                  sx={{ mt: 1 }}
                >
                  <Grid item>
                    <Typography variant="h6">
                      OUTS:{" "}
                      <span style={{ color: "grey" }}>{gameInfo.outs}</span>
                    </Typography>
                  </Grid>
                  <Grid item>
                    {" "}
                    <Typography variant="h6">
                      BALLS:{" "}
                      <span style={{ color: "grey" }}>{gameInfo.balls}</span>{" "}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">
                      STRIKES:{" "}
                      <span style={{ color: "grey" }}>{gameInfo.strikes}</span>{" "}
                    </Typography>
                  </Grid>
                  {gameInfo.manFirst ||
                  gameInfo.manSecond ||
                  gameInfo.manThird ? (
                    <Grid item>
                      <Typography variant="h6">
                        MAN ON:{" "}
                        <span style={{ color: "grey" }}>
                          {gameInfo.manFirst ? "FIRST " : ""}
                          {gameInfo.manSecond ? "SECOND " : ""}
                          {gameInfo.manThird ? "THIRD " : ""}
                        </span>
                      </Typography>
                    </Grid>
                  ) : (
                    <></>
                  )}
                </Grid>
                {(gameInfo.player1 == userInfo.username &&
                  gameInfo.p1runs < gameInfo.p2runs) ||
                (gameInfo.player2 == userInfo.username &&
                  gameInfo.p2runs < gameInfo.p1runs) ? (
                  <Button
                    sx={{ mt: 1 }}
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={async () => {
                      if (
                        confirm(
                          "Forfeit match? You will lose rating if you are in a competitive match."
                        )
                      ) {
                        await axios.post("/api/forfeit", {
                          email: userInfo.email,
                          password: userInfo.password,
                        });
                      }
                    }}
                  >
                    Forfeit match{" "}
                  </Button>
                ) : (
                  <></>
                )}
              </CardContent>
            </Card>
            <Card
              style={{
                width: "100%",
                marginTop: "20px",
                marginBottom: "20px",
              }}
              variant="outlined"
            >
              {" "}
              <CardContent
                sx={{ justifyContent: "center", textAlign: "center" }}
              >
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    {" "}
                    <TimerIcon
                      fontSize="large"
                      style={{ verticalAlign: "middle" }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="h5">
                      <span style={{ textDecoration: "underline" }}>
                        {timer}
                      </span>{" "}
                      seconds left before next pitch
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                  sx={{ mt: 1 }}
                >
                  <Grid item>
                    <Typography
                      variant="h5"
                      id="vibrantIcon"
                      sx={{ fontWeight: "bold" }}
                    >
                      {gameInfo.feedback}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="flex-start"
              spacing={4}
            >
              {gameInfo.isTopInning ? (
                <Grid item xs={3}>
                  <Card style={{ width: "100%" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        Pitcher
                      </Typography>
                      <Typography variant="h5" component="div"></Typography>
                      <Typography sx={{ mb: 0.5 }} variant="h5">
                        {gameInfo.p2pitcher.name}
                      </Typography>
                      <Typography color="text.secondary" variant="h6">
                        Stats:
                      </Typography>
                      <Typography color="text.secondary">
                        Pitching Power:{" "}
                        {gameInfo.p2pitcher.pitchCom >= 25 ? (
                          <span id="fire-text">
                            {gameInfo.p2pitcher.pitchCom}
                          </span>
                        ) : (
                          <>{gameInfo.p2pitcher.pitchCom}</>
                        )}
                      </Typography>
                      <Typography color="text.secondary">
                        Base Velocity:{" "}
                        {gameInfo.p2pitcher.strength >= 25 ? (
                          <span id="fire-text">
                            {gameInfo.p2pitcher.pitchCom * 7}
                          </span>
                        ) : (
                          <>{gameInfo.p2pitcher.strength * 7}</>
                        )}
                      </Typography>{" "}
                      <Typography>
                        <strong>Past velocities and guesses:</strong>
                      </Typography>
                      {gameInfo.pastFewPitches
                        .filter(
                          (value, index, self) =>
                            index ===
                            self.findIndex(
                              (t) =>
                                t.guess1 === value.guess1 &&
                                t.guess2 === value.guess2
                            )
                        )
                        .slice()
                        .reverse()
                        .map((asl) => {
                          return (
                            <Typography>
                              {asl.guess1 == -500 || asl.guess2 == 500 ? (
                                <>One player did not guess.</>
                              ) : (
                                <>
                                  {gameInfo.player1} {asl.guess1} mph,{" "}
                                  {gameInfo.player2} {asl.guess2} mph
                                </>
                              )}
                            </Typography>
                          );
                        })}
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <Grid item xs={3}>
                  <Card style={{ width: "100%" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        Pitcher
                      </Typography>
                      <Typography variant="h5" component="div"></Typography>
                      <Typography sx={{ mb: 0.5 }} variant="h5">
                        {gameInfo.p1pitcher.name}
                      </Typography>
                      <Typography color="text.secondary" variant="h6">
                        Stats:
                      </Typography>
                      <Typography color="text.secondary">
                        Pitching Power:{" "}
                        {gameInfo.p1pitcher.pitchCom >= 25 ? (
                          <span id="fire-text">
                            {gameInfo.p1pitcher.pitchCom}
                          </span>
                        ) : (
                          <>{gameInfo.p1pitcher.pitchCom}</>
                        )}
                      </Typography>
                      <Typography color="text.secondary">
                        Base Velocity:{" "}
                        {gameInfo.p1pitcher.strength >= 25 ? (
                          <span id="fire-text">
                            {gameInfo.p1pitcher.pitchCom * 7}
                          </span>
                        ) : (
                          <>{gameInfo.p1pitcher.strength * 7}</>
                        )}
                      </Typography>
                      <Typography>
                        <strong>Past velocities and guesses:</strong>
                      </Typography>
                      {gameInfo.pastFewPitches
                        .filter(
                          (value, index, self) =>
                            index ===
                            self.findIndex(
                              (t) =>
                                t.guess1 === value.guess1 &&
                                t.guess2 === value.guess2
                            )
                        )
                        .slice()
                        .reverse()
                        .map((asl) => {
                          return (
                            <Typography>
                              {asl.guess1 == -500 || asl.guess2 == 500 ? (
                                <>One player did not guess.</>
                              ) : (
                                <>
                                  {" "}
                                  {gameInfo.player2} {asl.guess1} mph,{" "}
                                  {gameInfo.player1} {asl.guess2} mph
                                </>
                              )}
                            </Typography>
                          );
                        })}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {gameInfo.player1 == userInfo.username ? (
                <>
                  {!gameInfo.isTopInning ? (
                    <Grid item xs={6}>
                      <Typography gutterBottom>
                        <span style={{ fontWeight: "bold", fontSize: "30px" }}>
                          You are pitching!
                        </span>
                        <br />
                        <br />
                        Choose a velocity to throw, within the range of the bar.
                      </Typography>
                      <Slider
                        defaultValue={gameInfo.p1pitcher.strength * 7}
                        min={
                          gameInfo.p1pitcher.strength * 7 -
                          gameInfo.p1pitcher.pitchCom
                        }
                        max={
                          gameInfo.p1pitcher.strength * 7 +
                          gameInfo.p1pitcher.pitchCom
                        }
                        valueLabelDisplay="auto"
                        onChange={(e, val) => {
                          setGuess(val);
                        }}
                      />
                      <Typography gutterBottom>
                        {" "}
                        Once both players submit or the timer ends, the pitch
                        will be thrown.
                      </Typography>
                      <Button
                        color="success"
                        variant="contained"
                        disabled={currentGuess == -1}
                        onClick={async () => {
                          await axios
                            .post("/api/guess", {
                              email: userInfo.email,
                              password: userInfo.password,
                              gameid: currentMatch,
                              guess: currentGuess,
                              uid: session.user.name,
                              lowRange:
                                gameInfo.p1pitcher.strength * 7 -
                                gameInfo.p1pitcher.pitchCom,
                              highRange:
                                gameInfo.p1pitcher.strength * 7 +
                                gameInfo.p1pitcher.pitchCom,
                            })
                            .then(() => {
                              setMessage(currentGuess + " has been submitted!");
                            });
                        }}
                        gutterBottom
                      >
                        Submit your Velocity
                      </Button>
                      {currentGuess != -1 ? (
                        <>
                          <Alert severity="info" sx={{ mt: 1 }}>
                            You dialed it to {currentGuess} mph.
                          </Alert>
                          {message != "" ? (
                            <Alert severity="success" sx={{ mt: 1 }}>
                              {message}
                            </Alert>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <Typography gutterBottom>
                        <span style={{ fontWeight: "bold", fontSize: "30px" }}>
                          You are hitting!
                        </span>
                        <br />
                        <br />
                        Guess the velocity! (You must move the slider at least
                        once every pitch, or your guess will be randomized.)
                      </Typography>
                      <Slider
                        defaultValue={gameInfo.p2pitcher.strength * 7}
                        min={
                          gameInfo.p2pitcher.strength * 7 -
                          gameInfo.p2pitcher.pitchCom
                        }
                        max={
                          gameInfo.p2pitcher.strength * 7 +
                          gameInfo.p2pitcher.pitchCom
                        }
                        valueLabelDisplay="auto"
                        onChange={(e, val) => {
                          setGuess(val);
                        }}
                      />
                      <Typography gutterBottom>
                        Once both players submit or the timer ends, the pitch
                        will be thrown.
                      </Typography>
                      <Button
                        color="success"
                        variant="contained"
                        disabled={currentGuess == -1}
                        onClick={async () => {
                          await axios
                            .post("/api/guess", {
                              email: userInfo.email,
                              password: userInfo.password,
                              gameid: currentMatch,
                              guess: currentGuess,
                              uid: session.user.name,
                              lowRange:
                                gameInfo.p2pitcher.strength * 7 -
                                gameInfo.p2pitcher.pitchCom,
                              highRange:
                                gameInfo.p2pitcher.strength * 7 +
                                gameInfo.p2pitcher.pitchCom,
                            })
                            .then(() => {
                              setMessage(currentGuess + " has been submitted!");
                            });
                        }}
                        gutterBottom
                      >
                        Submit your Guess
                      </Button>
                      {currentGuess != -1 ? (
                        <>
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Current Guess: {currentGuess} mph.
                          </Alert>{" "}
                          {message != "" ? (
                            <Alert severity="success" sx={{ mt: 1 }}>
                              {message}
                            </Alert>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  )}
                </>
              ) : (
                <>
                  {gameInfo.isTopInning ? (
                    <Grid item xs={6}>
                      <Typography gutterBottom>
                        <span style={{ fontWeight: "bold", fontSize: "30px" }}>
                          You are pitching!
                        </span>
                        <br />
                        <br />
                        Choose a velocity to throw, within the range of the bar.
                      </Typography>
                      <Slider
                        defaultValue={gameInfo.p2pitcher.strength * 7}
                        min={
                          gameInfo.p2pitcher.strength * 7 -
                          gameInfo.p2pitcher.pitchCom
                        }
                        max={
                          gameInfo.p2pitcher.strength * 7 +
                          gameInfo.p2pitcher.pitchCom
                        }
                        valueLabelDisplay="auto"
                        onChange={(e, val) => {
                          setGuess(val);
                        }}
                      />
                      <Typography gutterBottom>
                        {" "}
                        Once both players submit or the timer ends, the pitch
                        will be thrown.
                      </Typography>
                      <Button
                        color="success"
                        disabled={currentGuess == -1}
                        variant="contained"
                        onClick={async () => {
                          await axios
                            .post("/api/guess", {
                              email: userInfo.email,
                              password: userInfo.password,
                              gameid: currentMatch,
                              guess: currentGuess,
                              uid: session.user.name,
                              lowRange:
                                gameInfo.p2pitcher.strength * 7 -
                                gameInfo.p2pitcher.pitchCom,
                              highRange:
                                gameInfo.p2pitcher.strength * 7 +
                                gameInfo.p2pitcher.pitchCom,
                            })
                            .then(() => {
                              setMessage(currentGuess + " has been submitted!");
                            });
                        }}
                        gutterBottom
                      >
                        Submit your Velocity
                      </Button>
                      {currentGuess != -1 ? (
                        <>
                          <Alert severity="info" sx={{ mt: 1 }}>
                            You dialed it to {currentGuess} mph.
                          </Alert>{" "}
                          {message != "" ? (
                            <Alert severity="success" sx={{ mt: 1 }}>
                              {message}
                            </Alert>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <Typography gutterBottom>
                        <span style={{ fontWeight: "bold", fontSize: "30px" }}>
                          You are hitting!
                        </span>
                        <br />
                        <br />
                        Guess the velocity! (You must move the slider at least
                        once every pitch, or your guess will be randomized.)
                      </Typography>
                      <Slider
                        defaultValue={gameInfo.p1pitcher.strength * 7}
                        min={
                          gameInfo.p1pitcher.strength * 7 -
                          gameInfo.p1pitcher.pitchCom
                        }
                        max={
                          gameInfo.p1pitcher.strength * 7 +
                          gameInfo.p1pitcher.pitchCom
                        }
                        valueLabelDisplay="auto"
                        onChange={(e, val) => {
                          setGuess(val);
                        }}
                      />
                      <Typography gutterBottom>
                        {" "}
                        Once both players submit or the timer ends, the pitch
                        will be thrown.
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={currentGuess == -1}
                        onClick={async () => {
                          await axios
                            .post("/api/guess", {
                              email: userInfo.email,
                              password: userInfo.password,
                              gameid: currentMatch,
                              guess: currentGuess,
                              uid: session.user.name,
                              lowRange:
                                gameInfo.p1pitcher.strength * 7 -
                                gameInfo.p1pitcher.pitchCom,
                              highRange:
                                gameInfo.p1pitcher.strength * 7 +
                                gameInfo.p1pitcher.pitchCom,
                            })
                            .then(() => {
                              setMessage(currentGuess + " has been submitted!");
                            });
                        }}
                        gutterBottom
                      >
                        Submit your Guess
                      </Button>
                      {currentGuess != -1 ? (
                        <>
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Current Guess: {currentGuess} mph.
                          </Alert>{" "}
                          {message != "" ? (
                            <Alert severity="success" sx={{ mt: 1 }}>
                              {message}
                            </Alert>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  )}
                </>
              )}
              {gameInfo.isTopInning ? (
                <Grid item xs={3}>
                  <Card style={{ width: "100%" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        Now batting
                      </Typography>
                      <Typography variant="h5" component="div"></Typography>
                      <Typography sx={{ mb: 0.5 }} variant="h5">
                        #
                        {(gameInfo.currentBattingOrder %
                          gameInfo.p1batters.length) +
                          1}
                        :{" "}
                        {
                          gameInfo.p1batters[
                            gameInfo.currentBattingOrder %
                              gameInfo.p1batters.length
                          ].name
                        }
                      </Typography>
                      <Typography color="text.secondary" variant="h6">
                        Stats:
                      </Typography>
                      <Typography color="text.secondary">
                        Fielding Score:{" "}
                        {gameInfo.p1batters[
                          gameInfo.currentBattingOrder %
                            gameInfo.p1batters.length
                        ].fieldCom >= 25 ? (
                          <span id="fire-text">
                            {
                              gameInfo.p1batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p1batters.length
                              ].fieldCom
                            }
                          </span>
                        ) : (
                          <>
                            {
                              gameInfo.p1batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p1batters.length
                              ].fieldCom
                            }
                          </>
                        )}
                      </Typography>
                      <Typography color="text.secondary">
                        Hitting Strength:{" "}
                        {gameInfo.p1batters[
                          gameInfo.currentBattingOrder %
                            gameInfo.p1batters.length
                        ].strength >= 25 ? (
                          <span id="fire-text">
                            {
                              gameInfo.p1batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p1batters.length
                              ].strength
                            }
                          </span>
                        ) : (
                          <>
                            {
                              gameInfo.p1batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p1batters.length
                              ].strength
                            }
                          </>
                        )}
                      </Typography>{" "}
                      <Typography>
                        {gameInfo.p1batters[
                          gameInfo.currentBattingOrder %
                            gameInfo.p1batters.length
                        ].strength > 25
                          ? "A surefire power hitter."
                          : "Utility, contact man who can set up productive innings."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <Grid item xs={3}>
                  <Card style={{ width: "100%" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        Now batting
                      </Typography>
                      <Typography variant="h5" component="div"></Typography>
                      <Typography sx={{ mb: 0.5 }} variant="h5">
                        #
                        {(gameInfo.currentPitcherPower %
                          gameInfo.p2batters.length) +
                          1}
                        :{" "}
                        {
                          gameInfo.p2batters[
                            gameInfo.currentPitcherPower %
                              gameInfo.p2batters.length
                          ].name
                        }
                      </Typography>
                      <Typography color="text.secondary" variant="h6">
                        Stats:
                      </Typography>
                      <Typography color="text.secondary">
                        Fielding Score:{" "}
                        {gameInfo.p2batters[
                          gameInfo.currentBattingOrder %
                            gameInfo.p2batters.length
                        ].fieldCom >= 25 ? (
                          <span id="fire-text">
                            {
                              gameInfo.p2batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p2batters.length
                              ].fieldCom
                            }
                          </span>
                        ) : (
                          <>
                            {
                              gameInfo.p2batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p2batters.length
                              ].fieldCom
                            }
                          </>
                        )}
                      </Typography>
                      <Typography color="text.secondary">
                        Hitting Strength:{" "}
                        {gameInfo.p2batters[
                          gameInfo.currentBattingOrder %
                            gameInfo.p2batters.length
                        ].strength >= 25 ? (
                          <span id="fire-text">
                            {
                              gameInfo.p2batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p2batters.length
                              ].strength
                            }
                          </span>
                        ) : (
                          <>
                            {
                              gameInfo.p2batters[
                                gameInfo.currentBattingOrder %
                                  gameInfo.p2batters.length
                              ].strength
                            }
                          </>
                        )}
                      </Typography>{" "}
                      <Typography>
                        {gameInfo.p2batters[
                          gameInfo.currentPitcherPower %
                            gameInfo.p2batters.length
                        ].strength > 25
                          ? "A surefire power hitter."
                          : "Utility, contact man who can set up productive innings."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Container>
        </>
      );
    } else {
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
    }
  } else
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
