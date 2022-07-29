import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

// POST request requires fields:
// email
// password
// id
// isRanked
// elo

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bsblDB");
  let isAuthenticated = false;
  if (req.method == "POST") {
    // check valid authentication, if username and passwords count. then check if id is in queue right now
    await db
      .collection("account")
      .findOne({ email: req.body.email })
      .then((u) => {
        if (u) {
          if (u.password == req.body.password) {
            // authenticated
            isAuthenticated = true;
          }
        }
      });
    if (isAuthenticated) {
      let p1id = "";
      await db
        .collection("games")
        .findOne({ _id: ObjectId(req.body.gameid) })
        .then((el) => {
          p1id = el.player1;
        });
      if (
        req.body.guess >= req.body.lowRange &&
        req.body.guess <= req.body.highRange
      ) {
        if (p1id == req.body.uid) {
          await db
            .collection("games")
            .updateOne(
              { _id: ObjectId(req.body.gameid) },
              {
                $set: {
                  p1currGuess: req.body.guess,
                },
              }
            )
            .then(() => {
              res.json("Submitted guess successfully.");
            });
        } else {
          await db
            .collection("games")
            .updateOne(
              { _id: ObjectId(req.body.gameid) },
              {
                $set: {
                  p2currGuess: req.body.guess,
                },
              }
            )
            .then(() => {
              res.json("Submitted guess successfully.");
            });
        }
      } else {
        res.json({ success: false });
      }
    }
  } else {
    res.json({ success: false });
  }
}
