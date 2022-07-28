import Head from "next/head";
import Link from "next/link";
import clientPromise from "../lib/mongodb";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import CancelIcon from "@mui/icons-material/Cancel";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
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
    name: "SILVER",
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
    color: "",
  },
  {
    name: "SHIMMERING",
    color: "",
  },
];

const images = [
  {
    url: "mainbaseball.jpg",
    title: "Start an unranked match",
    width: "100%",
  },
  {
    url: "compbaseball.jpg",
    title: "Start a ranked match",
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
  const [open, setOpen] = useState(false);
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

  const refreshForMatchUnranked = () => {
    setTimeout(async () => {
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
    await axios.get("/api/queue", {
      headers: {
        uid: session.user.name,
        ranked: false,
      },
    });
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
    return <p>Loading...</p>;
  } else if (!session && !loading && isLoading) {
    return (
      <div className="container">
        <Head>
          <title>BSBLR</title>
        </Head>

        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js with MongoDB!</a>
        </h1>
        <Link href="/login">Login here</Link>
      </div>
    );
  }
  if (session && !isLoading) {
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
            alignItems="center"
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
                        Level: {userInfo.exp / 1000}
                      </Typography>
                      <BorderLinearProgress
                        variant="determinate"
                        value={(userInfo.exp / 10) % 100}
                      />
                      <Typography variant="body2">
                        Tickets: {userInfo.tickets}
                      </Typography>
                      <Typography variant="body2">
                        Joined:{" "}
                        {Math.round(
                          (new Date(moment().format()).getTime() -
                            new Date(userInfo.createdOn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        {!Math.round(
                          (new Date(moment().format()).getTime() -
                            new Date(userInfo.createdOn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) == 1 ? (
                          <>days</>
                        ) : (
                          <>day</>
                        )}{" "}
                        ago
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <ButtonGroup
                        orientation="vertical"
                        variant="text"
                        sx={{ width: "100%" }}
                      >
                        <Button size="small">View My Players</Button>
                        <Button size="small">View career</Button>
                        <Button
                          size="small"
                          onClick={() => {
                            signOut();
                          }}
                        >
                          Sign out
                        </Button>
                      </ButtonGroup>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item>
                  <Card style={{ width: "15vw" }} variant="outlined">
                    {" "}
                    <CardContent>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        Start a Friendly Game
                      </Typography>
                      <Typography variant="h5" component="div"></Typography>
                      <Typography
                        sx={{ mb: 0.5 }}
                        variant="h6"
                        color="text.secondary"
                      >
                        Friend List
                      </Typography>
                      <List>
                        {userInfo.friends != undefined &&
                        userInfo.friends.length == 0 ? (
                          <>
                            <Typography>No friends currently.</Typography>
                          </>
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
                                    <IconButton edge="end">
                                      <SportsBaseballIcon color="secondary" />
                                    </IconButton>
                                    <IconButton edge="end" sx={{ ml: 1.5 }}>
                                      <CancelIcon color="secondary" />
                                    </IconButton>
                                  </>
                                }
                              >
                                <ListItemText primary={"hhi"} />
                              </ListItem>
                            );
                          })}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Add Friends</Button>
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
                    component="img"
                    sx={{
                      height: 85,
                      borderRadius: "50%",
                      border: 10,
                      borderColor:
                        ranks[Math.floor(userInfo.elo / 200)] != undefined
                          ? ranks[Math.floor(userInfo.elo / 200)].color
                          : "grey",
                    }}
                    src="silhouette.png"
                  />
                </Grid>
                <Grid item>
                  {" "}
                  <Typography
                    variant="h5"
                    sx={{
                      color:
                        ranks[Math.floor(userInfo.elo / 200)] != undefined
                          ? ranks[Math.floor(userInfo.elo / 200)].color
                          : "grey",
                    }}
                  >
                    {ranks[Math.floor(userInfo.elo / 200)] != undefined
                      ? ranks[Math.floor(userInfo.elo / 200)].name
                      : ""}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="overline">Current Rank</Typography>
                </Grid>
              </Grid>
              <Typography
                sx={{
                  color:
                    ranks[Math.floor(userInfo.elo / 200)] != undefined
                      ? ranks[Math.floor(userInfo.elo / 200)].color
                      : "grey",
                  mt: -1,
                }}
              >
                {userInfo.elo % 200}/200
              </Typography>
              <BorderLinearProgress
                variant="determinate"
                value={(userInfo.elo / 2) % 100}
              />
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
              >
                Acquire Players
              </Button>
              <Button
                variant="outlined"
                sx={{ width: "100%", borderRadius: "15px", mt: 2 }}
              >
                Tutorial
              </Button>
              {/* acquire new players, tutorial */}
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
                      >
                        Leaderboard
                      </Typography>
                      <Typography variant="body2">
                        well meaning and kindly.
                        <br />
                        {'"a benevolent smile"'}
                      </Typography>{" "}
                    </CardContent>
                    <CardActions>
                      <Button size="small">Learn More</Button>
                    </CardActions>
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
              You will be matched with someone with similar rank. Please stand
              by.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
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
