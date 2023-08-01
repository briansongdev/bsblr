import Head from "next/head";
import Link from "next/link";
import clientPromise from "../lib/mongodb";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import CancelIcon from "@mui/icons-material/Cancel";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ButtonBase from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
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
} from "@mui/material";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import moment from "moment";
import { useRouter } from "next/router";

// id in mongo is session.user.name

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

const ranks = [
  {
    name: "RUSTY",
    color: "#a08679",
  },
  {
    name: "STEELED",
    color: "#c0c0c0",
  },
  {
    name: "GOLDEN",
    color: "#d4af37",
  },
  {
    name: "EMERALD",
    color: "#34ac90",
  },
  {
    name: "PRISMATIC",
    color: "#a890fe",
  },
  {
    name: "SHIMMERING",
    color: "highRankIcon",
  },
];

const images = [
  {
    url: "mainbaseball.jpg",
    title: "Search for an unranked match",
    width: "100%",
  },
  {
    url: "compbaseball.jpg",
    title: "Search for a ranked match",
    width: "100%",
  },
];

const ImageMarked = styled("span")(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: "absolute",
  bottom: -2,
  left: "calc(50% - 9px)",
  transition: theme.transitions.create("opacity"),
}));

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: "relative",
  height: 125,
  [theme.breakpoints.down("sm")]: {
    width: "100% !important", // Overrides inline-style
    height: 100,
  },
  "&:hover, &.Mui-focusVisible": {
    zIndex: 1,
    "& .MuiImageBackdrop-root": {
      opacity: 0.15,
    },
    "& .MuiImageMarked-root": {
      opacity: 0,
    },
    "& .MuiTypography-root": {
      border: "4px solid currentColor",
    },
  },
}));

const ImageSrc = styled("span")({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: "cover",
  backgroundPosition: "center 40%",
});

const Image = styled("span")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled("span")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create("opacity"),
}));

export default function Home({ isConnected }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [addFriendVal, setFriendVal] = useState("");
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [tutOpen, setTutOpen] = useState(false);
  const handleClose = async () => {
    setOpen(false);
    await axios
      .get("/api/auth/account", {
        headers: {
          uid: session.user.name,
        },
      })
      .then(async (res) => {
        if (res.data.currentMatch == "") {
          await axios.post("/api/remove", {
            email: userInfo.email,
            password: userInfo.password,
            uid: session.user.name,
          });
        } else {
          router.push("/game");
        }
      });
  };
  const handleClose1 = async () => {
    setOpen1(false);
    await axios
      .get("/api/auth/account", {
        headers: {
          uid: session.user.name,
        },
      })
      .then(async (res) => {
        if (res.data.currentMatch == "") {
          await axios.post("/api/remove", {
            email: userInfo.email,
            password: userInfo.password,
            uid: session.user.name,
          });
        } else {
          router.push("/game");
        }
      });
  };
  const handleClose2 = () => setTutOpen(false);

  const refreshForMatchFriend = (friendToken) => {
    const checkI = setTimeout(async () => {
      await axios
        .get("/api/friendQueue", {
          headers: {
            uid: session.user.name,
            friendid: friendToken,
          },
        })
        .then((res) => {
          if (res.data.success) {
            if (res.data.message == "Game has started.") {
              router.push("/game");
            }
          } else {
            alert("Problem getting data. Please refresh and try again.");
          }
        });
    }, 1000);
  };

  const refreshForMatchUnranked = () => {
    const checkI = setTimeout(async () => {
      await axios
        .get("/api/queue", {
          headers: {
            uid: session.user.name,
            ranked: false,
          },
        })
        .then((res) => {
          if (res.data.success) {
            if (res.data.message == "Game has started.") {
              router.push("/game");
            }
          } else {
            alert("Problem getting data. Please refresh and try again.");
          }
        });
    }, 1000);
  };

  const refreshForMatchRanked = async () => {
    const checkI = setTimeout(async () => {
      await axios
        .get("/api/queue", {
          headers: {
            uid: session.user.name,
            ranked: true,
          },
        })
        .then((res) => {
          if (res.data.success) {
            if (res.data.message == "Game has started.") {
              router.push("/game");
            }
          } else {
            alert("Problem getting data. Please refresh and try again.");
          }
        });
    }, 1000);
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
          <CircularProgress />
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
          <Typography variant="h3">BSBLR</Typography>
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
                      <Typography color="text.secondary" gutterBottom>
                        About me
                      </Typography>
                      <Typography style={{ textDecoration: "underline" }}>
                        {userInfo.username}
                      </Typography>
                      <Typography variant="body2">
                        Level: {Math.floor(userInfo.exp / 1000)}
                      </Typography>
                      <BorderLinearProgress
                        variant="determinate"
                        value={(userInfo.exp / 10) % 100}
                      />
                      <Typography variant="body2">
                        Tickets: {userInfo.tickets} (+10 daily reward)
                      </Typography>
                      <Typography variant="body2">
                        Joined:{" "}
                        {Math.ceil(
                          (new Date(moment().format()).getTime() -
                            new Date(userInfo.createdOn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        {!(
                          Math.ceil(
                            (new Date(moment().format()).getTime() -
                              new Date(userInfo.createdOn).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) == 1
                        ) ? (
                          <>days</>
                        ) : (
                          <>day</>
                        )}{" "}
                        ago
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
                </Grid>
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography
                        sx={{ mb: 0.5 }}
                        variant="h6"
                        color="text.secondary"
                      >
                        Friend List
                      </Typography>
                      <List>
                        {userInfo.friendReqs != undefined &&
                        userInfo.friendReqs.length != 0 ? (
                          <Typography color="text.secondary">
                            Requests
                          </Typography>
                        ) : (
                          <></>
                        )}
                        {userInfo.friendReqs != undefined &&
                          userInfo.friendReqs.map((d) => {
                            return (
                              <ListItem
                                disablePadding
                                secondaryAction={
                                  <>
                                    <IconButton edge="end">
                                      <CheckCircleIcon
                                        color="primary"
                                        onClick={async () => {
                                          await axios
                                            .post("/api/friend", {
                                              email: userInfo.email,
                                              password: userInfo.password,
                                              username: userInfo.username,
                                              friendUsername: d,
                                            })
                                            .then((answer) => {
                                              alert(answer.data.message);
                                              window.location.reload();
                                            });
                                        }}
                                      />
                                    </IconButton>
                                    <IconButton edge="end" sx={{ ml: 1.5 }}>
                                      <CancelIcon
                                        color="primary"
                                        onClick={async () => {
                                          await axios
                                            .post("/api/removeFriend", {
                                              email: userInfo.email,
                                              password: userInfo.password,
                                              username: userInfo.username,
                                              friendUsername: d,
                                            })
                                            .then((answer) => {
                                              alert(answer.data.message);
                                              window.location.reload();
                                            });
                                        }}
                                      />
                                    </IconButton>
                                  </>
                                }
                              >
                                <ListItemText primary={d} />
                              </ListItem>
                            );
                          })}
                        {userInfo.friends != undefined &&
                        userInfo.friends.length != 0 ? (
                          <Typography color="text.secondary">
                            Friends
                          </Typography>
                        ) : (
                          <></>
                        )}
                        {userInfo.friends != undefined &&
                          userInfo.friends.map((d) => {
                            return (
                              <ListItem
                                disablePadding
                                secondaryAction={
                                  <>
                                    <Tooltip
                                      title={
                                        "Start a friendly battle with " + d
                                      }
                                    >
                                      <IconButton edge="end">
                                        <SportsBaseballIcon
                                          color="primary"
                                          onClick={async () => {
                                            await axios
                                              .post("/api/friendQueue", {
                                                email: userInfo.email,
                                                password: userInfo.password,
                                                id: session.user.name,
                                              })
                                              .then((u) => {
                                                if (u.data.success) {
                                                  refreshForMatchFriend(d);
                                                } else {
                                                  alert(
                                                    "Error. Please try again."
                                                  );
                                                }
                                              });
                                            setOpen1(true);
                                          }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                    <IconButton edge="end" sx={{ ml: 1.5 }}>
                                      <CancelIcon
                                        color="primary"
                                        onClick={async () => {
                                          await axios
                                            .post("/api/removeFriend", {
                                              email: userInfo.email,
                                              password: userInfo.password,
                                              username: userInfo.username,
                                              friendUsername: d,
                                            })
                                            .then((answer) => {
                                              alert(answer.data.message);
                                              window.location.reload();
                                            });
                                        }}
                                      />
                                    </IconButton>
                                  </>
                                }
                              >
                                <ListItemText primary={d} />
                              </ListItem>
                            );
                          })}
                        {userInfo.friends != undefined &&
                        userInfo.friends.length == 0 ? (
                          <>
                            <Typography>No friends currently.</Typography>
                          </>
                        ) : (
                          <></>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Add Friends
                      </Typography>
                      <TextField
                        label="Username"
                        value={addFriendVal}
                        onChange={(e) => {
                          setFriendVal(e.target.value);
                        }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        disabled={addFriendVal == ""}
                        onClick={async () => {
                          await axios
                            .post("/api/friend", {
                              email: userInfo.email,
                              password: userInfo.password,
                              username: userInfo.username,
                              friendUsername: addFriendVal,
                            })
                            .then((answer) => {
                              alert(answer.data.message);
                              window.location.reload();
                            });
                        }}
                      >
                        Send Request
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid
                container
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{ mb: 1 }}
              >
                <Grid item>
                  <Box
                    id={
                      ranks[
                        Math.min(
                          ranks.length - 1,
                          Math.floor(userInfo.elo / 200)
                        )
                      ] != undefined &&
                      ranks[
                        Math.min(
                          ranks.length - 1,
                          Math.floor(userInfo.elo / 200)
                        )
                      ].color == "highRankIcon"
                        ? "highRankPlaque"
                        : ""
                    }
                    component="img"
                    sx={{
                      height: 85,
                      borderRadius: "50%",
                      border: 10,
                      borderColor:
                        ranks[
                          Math.min(
                            ranks.length - 1,
                            Math.floor(userInfo.elo / 200)
                          )
                        ] != undefined
                          ? ranks[
                              Math.min(
                                ranks.length - 1,
                                Math.floor(userInfo.elo / 200)
                              )
                            ].color
                          : "grey",
                    }}
                    src="silhouette.png"
                  />
                </Grid>
                <Grid item>
                  {" "}
                  <Typography
                    variant="h4"
                    id={
                      ranks[
                        Math.min(
                          ranks.length - 1,
                          Math.floor(userInfo.elo / 200)
                        )
                      ] != undefined
                        ? ranks[
                            Math.min(
                              ranks.length - 1,
                              Math.floor(userInfo.elo / 200)
                            )
                          ].color
                        : ""
                    }
                    sx={{
                      color:
                        ranks[
                          Math.min(
                            ranks.length - 1,
                            Math.floor(userInfo.elo / 200)
                          )
                        ] != undefined
                          ? ranks[
                              Math.min(
                                ranks.length - 1,
                                Math.floor(userInfo.elo / 200)
                              )
                            ].color
                          : "grey",
                    }}
                  >
                    {ranks[
                      Math.min(ranks.length - 1, Math.floor(userInfo.elo / 200))
                    ] != undefined
                      ? ranks[
                          Math.min(
                            ranks.length - 1,
                            Math.floor(userInfo.elo / 200)
                          )
                        ].name
                      : ""}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="overline">
                    Current Competitive Rank
                  </Typography>
                </Grid>
              </Grid>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography
                    sx={{
                      color:
                        ranks[
                          Math.min(
                            ranks.length - 1,
                            Math.floor(userInfo.elo / 200)
                          )
                        ] != undefined
                          ? ranks[
                              Math.min(
                                ranks.length - 1,
                                Math.floor(userInfo.elo / 200)
                              )
                            ].color
                          : "grey",
                      mt: -1,
                    }}
                    id={
                      ranks[
                        Math.min(
                          ranks.length - 1,
                          Math.floor(userInfo.elo / 200)
                        )
                      ] != undefined
                        ? ranks[
                            Math.min(
                              ranks.length - 1,
                              Math.floor(userInfo.elo / 200)
                            )
                          ].color
                        : ""
                    }
                  >
                    {ranks[
                      Math.min(ranks.length - 1, Math.floor(userInfo.elo / 200))
                    ].color == "highRankIcon"
                      ? userInfo.elo + "/1000"
                      : (userInfo.elo % 200) + "/200"}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ mt: -1 }}>
                    <span
                      style={{
                        color:
                          ranks[
                            Math.min(
                              ranks.length - 1,
                              Math.floor(userInfo.elo / 200) + 1
                            )
                          ] != undefined
                            ? ranks[
                                Math.min(
                                  ranks.length - 1,
                                  Math.floor(userInfo.elo / 200) + 1
                                )
                              ].color
                            : "grey",
                        mt: -1,
                      }}
                      id={
                        ranks[
                          Math.min(
                            ranks.length - 1,
                            Math.floor(userInfo.elo / 200) + 1
                          )
                        ] != undefined
                          ? ranks[
                              Math.min(
                                ranks.length - 1,
                                Math.floor(userInfo.elo / 200) + 1
                              )
                            ].color
                          : ""
                      }
                    >
                      {ranks[
                        Math.min(
                          ranks.length - 1,
                          Math.floor(userInfo.elo / 200) + 1
                        )
                      ] != undefined &&
                      ranks[
                        Math.min(
                          ranks.length - 1,
                          Math.floor(userInfo.elo / 200) + 1
                        )
                      ].name != "SHIMMERING"
                        ? ranks[
                            Math.min(
                              ranks.length - 1,
                              Math.floor(userInfo.elo / 200) + 1
                            )
                          ].name
                        : ""}
                    </span>
                  </Typography>
                </Grid>
              </Grid>
              {ranks[Math.min(ranks.length - 1, Math.floor(userInfo.elo / 200))]
                .color == "highRankIcon" ? (
                <></>
              ) : (
                <BorderLinearProgress
                  variant="determinate"
                  sx={{
                    "& .MuiLinearProgress-bar1Determinate": {
                      backgroundColor:
                        ranks[
                          Math.min(
                            ranks.length - 1,
                            Math.floor(userInfo.elo / 200)
                          )
                        ] != undefined
                          ? ranks[
                              Math.min(
                                ranks.length - 1,
                                Math.floor(userInfo.elo / 200)
                              )
                            ].color
                          : "grey",
                    },
                  }}
                  value={(userInfo.elo / 2) % 100}
                />
              )}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  minWidth: 300,
                  width: "100%",
                  mt: 2,
                }}
              >
                <ImageButton
                  focusRipple
                  key={images[0].title}
                  style={{
                    width: images[0].width,
                    borderRadius: "15px",
                  }}
                  onClick={async () => {
                    await axios
                      .post("/api/queue", {
                        email: userInfo.email,
                        password: userInfo.password,
                        id: session.user.name,
                        isRanked: false,
                        elo: userInfo.elo,
                      })
                      .then((u) => {
                        if (u.data.success) {
                          refreshForMatchUnranked();
                        } else {
                          alert("Error. Please try again.");
                        }
                      });
                    setOpen(true);
                  }}
                >
                  <ImageSrc
                    style={{
                      backgroundImage: `url(${images[0].url})`,
                      borderRadius: "15px",
                    }}
                  />
                  <ImageBackdrop
                    className="MuiImageBackdrop-root"
                    sx={{ borderRadius: "15px" }}
                  />
                  <Image>
                    <Typography
                      component="span"
                      variant="subtitle1"
                      color="inherit"
                      sx={{
                        position: "relative",
                        p: 4,
                        pt: 2,
                        pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                      }}
                    >
                      {images[0].title}
                      <ImageMarked className="MuiImageMarked-root" />
                    </Typography>
                  </Image>
                </ImageButton>
              </Box>{" "}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  minWidth: 300,
                  width: "100%",
                  mt: 2,
                }}
              >
                <ImageButton
                  focusRipple
                  key={images[1].title}
                  style={{
                    width: images[1].width,
                    borderRadius: "15px",
                  }}
                  onClick={async () => {
                    await axios
                      .post("/api/queue", {
                        email: userInfo.email,
                        password: userInfo.password,
                        id: session.user.name,
                        isRanked: true,
                        elo: userInfo.elo,
                      })
                      .then((u) => {
                        if (u.data.success) {
                          refreshForMatchRanked();
                        } else {
                          alert("Error. Please try again.");
                        }
                      });
                    setOpen(true);
                  }}
                >
                  <ImageSrc
                    style={{
                      backgroundImage: `url(${images[1].url})`,
                      borderRadius: "15px",
                    }}
                  />
                  <ImageBackdrop
                    className="MuiImageBackdrop-root"
                    sx={{ borderRadius: "15px" }}
                  />
                  <Image>
                    <Typography
                      component="span"
                      variant="subtitle1"
                      color="inherit"
                      sx={{
                        position: "relative",
                        p: 4,
                        pt: 2,
                        pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                      }}
                    >
                      {images[1].title}
                      <ImageMarked className="MuiImageMarked-root" />
                    </Typography>
                  </Image>
                </ImageButton>
              </Box>
              <Button
                variant="contained"
                sx={{ width: "100%", borderRadius: "15px", mt: 2 }}
                onClick={() => {
                  router.push("/acquire");
                }}
              >
                Acquire Players
              </Button>
              <Button
                variant="outlined"
                sx={{ width: "100%", borderRadius: "15px", mt: 2 }}
                onClick={() => setTutOpen(true)}
              >
                Tutorial
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Grid
                container
                direction="column"
                alignItems="flex-end"
                spacing={2}
              >
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography
                        variant="h5"
                        component="div"
                        color="text.secondary"
                        gutterBottom
                      >
                        My Match History
                      </Typography>
                      {userInfo.matchHistory.length == 0 ? (
                        <Typography>
                          No matches played. Start your first one!
                        </Typography>
                      ) : (
                        <></>
                      )}
                      {userInfo.matchHistory
                        .slice()
                        .reverse()
                        .map((el) => {
                          if (el.eloChange == 0) {
                            if (el.winner == session.user.name) {
                              return (
                                <Typography>
                                  Unranked: {el.p1Score} - {el.p2Score}
                                </Typography>
                              );
                            } else {
                              return (
                                <Typography>
                                  Unranked: {el.p2Score} - {el.p1Score}
                                </Typography>
                              );
                            }
                          } else {
                            if (el.eloChange < 0) {
                              if (el.p1Score > el.p2Score) {
                                return (
                                  <Typography>
                                    Ranked: {el.p2Score} - {el.p1Score} (-
                                    {Math.abs(el.eloChange)} rating)
                                  </Typography>
                                );
                              } else {
                                return (
                                  <Typography>
                                    Ranked: {el.p1Score} - {el.p2Score} (-
                                    {Math.abs(el.eloChange)} rating)
                                  </Typography>
                                );
                              }
                            } else {
                              if (el.p1Score > el.p2Score) {
                                return (
                                  <Typography>
                                    Ranked: {el.p1Score} - {el.p2Score} (+
                                    {el.eloChange} rating)
                                  </Typography>
                                );
                              } else {
                                return (
                                  <Typography>
                                    Ranked: {el.p2Score} - {el.p1Score} (+
                                    {el.eloChange} rating)
                                  </Typography>
                                );
                              }
                            }
                          }
                        })}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography
                        variant="h5"
                        component="div"
                        color="text.secondary"
                      >
                        Leaderboard
                      </Typography>
                      <Typography variant="body2">
                        Coming out soon, as more players join.
                      </Typography>{" "}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
        <Dialog open={open}>
          <DialogTitle>Entering queue...</DialogTitle>
          <DialogContent
            sx={{ textAlign: "center", justifyContent: "content" }}
          >
            <CircularProgress color="success" />
            <DialogContentText>
              You will be matched with someone with similar rank, if you are
              queueing for ranked play.
              <Typography color="text.secondary">
                <br />
                Please don't reload or close the tab.
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={open1}>
          <DialogTitle>Waiting for friend...</DialogTitle>
          <DialogContent
            sx={{ textAlign: "center", justifyContent: "content" }}
          >
            <CircularProgress color="success" />
            <DialogContentText>
              Once your friend also selects to friendly battle you (or is
              currently in an unranked queue), you both will be matched into a
              game.
              <Typography color="text.secondary">
                <br />
                Please don't reload or close the tab.
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose1}>Cancel</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={tutOpen}>
          <DialogTitle>Tutorial: Welcome to BSBLR!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Acquire players from the shop, using credits that you can obtain
              from daily logins.
            </DialogContentText>
            <br />
            <DialogContentText>
              Assign these players to your team and battle it up 1v1 with other
              players from around the world or around your rank.
            </DialogContentText>
            <br />
            <DialogContentText>
              In every inning, the outcome of your batters and pitchers comes
              down to how close the batter's guess of the velocity of the
              pitcher's pitch is.
            </DialogContentText>
            <br />
            <DialogContentText>
              However, having a stronger pitcher or a better hitter DOES make a
              difference!
            </DialogContentText>
            <br />
            <DialogContentText>
              Pull some players, try it out and see for yourself by BSBLR is the
              best game for baseball out there.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose2}>Got it!</Button>
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
