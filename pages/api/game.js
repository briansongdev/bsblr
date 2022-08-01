import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  let username = "";
  const client = await clientPromise;
  const db = client.db("bsblDB");
  let isAuthenticated = false;
  if (req.method == "GET") {
    // check valid authentication, if username and passwords count. then check if id is in queue right now
    await db
      .collection("account")
      .findOne({ email: req.headers["email"] })
      .then((u) => {
        if (u) {
          if (u.password == req.headers["password"]) {
            // authenticated
            isAuthenticated = true;
            username = u.username;
          }
        }
      });
    if (isAuthenticated) {
      if (JSON.parse(JSON.stringify(req.headers)).gameid == "") {
        res.json("Invalid call.");
      } else {
        let gameObj;
        await db
          .collection("games")
          .findOne({
            _id: ObjectId(JSON.parse(JSON.stringify(req.headers)).gameid),
          })
          .then(async (u) => {
            if (u) {
              let p1, p2, elo1, elo2;
              await db
                .collection("account")
                .findOne({ _id: ObjectId(u.player1) })
                .then((c) => {
                  p1 = c.username;
                  elo1 = c.elo;
                });
              await db
                .collection("account")
                .findOne({ _id: ObjectId(u.player2) })
                .then((c) => {
                  p2 = c.username;
                  elo2 = c.elo;
                });
              gameObj = {
                player1: p1,
                player2: p2,
                isRanked: u.isRanked,
                currentInning: u.currentInning,
                isTopInning: u.isTopInning,
                outs: u.outs,
                p1runs: u.p1runs,
                p2runs: u.p2runs,
                currentPitcherPower: u.currentPitcherPower,
                currentBattingOrder: u.currentBattingOrder,
                manFirst: u.manFirst,
                manSecond: u.manSecond,
                manThird: u.manThird,
                p1batters: u.p1batters,
                p2batters: u.p2batters,
                p1pitcher: u.p1pitcher,
                p2pitcher: u.p2pitcher,
                countdown: u.countdown,
                balls: u.balls,
                strikes: u.strikes,
                feedback: u.feedback,
                pastFewPitches: u.pastFewPitches,
              };
              if (p1 == username && u.countdown == -1) {
                // start countdown
                await db
                  .collection("games")
                  .updateOne(
                    {
                      _id: ObjectId(
                        JSON.parse(JSON.stringify(req.headers)).gameid
                      ),
                    },
                    {
                      $set: {
                        countdown: Math.floor(
                          20000 / (0.5 * elo1 + 0.5 * elo2 + 1000)
                        ),
                      },
                    }
                  )
                  .then(() => {
                    res.json(gameObj);
                  });
              } else {
                res.json(gameObj);
              }
            } else {
              res.json(
                "Problem with data. Please refresh the page and try again."
              );
            }
          });
      }
    } else {
      res.json({ message: "Unauthenticated.", success: false });
    }
  }
}
