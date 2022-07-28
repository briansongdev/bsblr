import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
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
          }
        }
      });
    if (isAuthenticated) {
      let gameObj;
      await db
        .collection("games")
        .findOne({ _id: ObjectId(req.headers["gameid"]) })
        .then(async (u) => {
          if (u) {
            let p1, p2;
            await db
              .collection("account")
              .findOne({ _id: ObjectId(u.player1) })
              .then((c) => {
                p1 = c.username;
              });
            await db
              .collection("account")
              .findOne({ _id: ObjectId(u.player2) })
              .then((c) => {
                p2 = c.username;
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
            };
            res.json(gameObj);
          } else {
            res.json(
              "Problem with data. Please refresh the page and try again."
            );
          }
        });
    } else {
      res.json({ message: "Unauthenticated.", success: false });
    }
  }
}
