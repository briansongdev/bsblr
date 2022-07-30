import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

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
      let alreadyInQueue = true;
      await db
        .collection("queue")
        .findOne({ uid: req.body.id })
        .then((u) => {
          if (!u) alreadyInQueue = false;
        });
      if (!alreadyInQueue) {
        try {
          await db.collection("queue").insertOne({
            uid: req.body.id,
            ranked: false,
          });
          return res.json({
            success: true,
          });
        } catch (error) {
          // return an error
          return res.json({
            message: new Error(error).message,
            success: false,
          });
        }
      } else {
        return res.json({
          success: false,
        });
      }
    } else {
      return res.json({
        success: false,
      });
    }
  } else if (req.method == "GET") {
    // if no id in database, means other player started game.
    try {
      let startedAlr = false;
      const token = req.headers["uid"],
        friendToken = req.headers["friendid"];
      await db
        .collection("queue")
        .findOne({ uid: token })
        .then((u) => {
          if (!u) {
            startedAlr = true;
            return res.json({
              message: "Game started already.",
              success: true,
            });
          }
        });
      if (!startedAlr) {
        let otherUserId = "",
          finalOtherId = "";
        let p1play, p2play, p1pit, p2pit;
        await db
          .collection("account")
          .findOne({ _id: ObjectId(token) })
          .then((b) => {
            p1play = b.lineup;
            p1pit = b.currPitcher;
          });
        await db
          .collection("account")
          .findOne({ username: friendToken })
          .then((b) => {
            otherUserId = b._id.toString();
          });
        await db
          .collection("queue")
          .find()
          .forEach(async (u) => {
            if (u.uid == otherUserId && !u.ranked) {
              finalOtherId = otherUserId;
              await db
                .collection("account")
                .findOne({ _id: ObjectId(u.uid) })
                .then((b) => {
                  p2play = b.lineup;
                  p2pit = b.currPitcher;
                });
            }
          });
        if (finalOtherId != "") {
          let insId = "";
          await db.collection("queue").deleteOne({ uid: finalOtherId });
          await db.collection("queue").deleteOne({ uid: token });
          await db
            .collection("games")
            .insertOne({
              createdOn: new Date(),
              player1: token,
              player2: finalOtherId,
              isRanked: false,
              currentInning: 1,
              isTopInning: true,
              outs: 0,
              p1runs: 0,
              p2runs: 0,
              currentPitcherPower: 0,
              currentBattingOrder: 0,
              manFirst: false,
              manSecond: false,
              manThird: false,
              p1batters: p1play,
              p2batters: p2play,
              p1pitcher: p1pit,
              p2pitcher: p2pit,
              countdown: -1,
              balls: 0,
              strikes: 0,
              pastFewPitches: [],
              p1currGuess: -1,
              p2currGuess: -1,
            })
            .then((a) => {
              insId = a.insertedId;
            });
          await db.collection("account").updateOne(
            { _id: ObjectId(token) },
            {
              $set: {
                currentMatch: insId.toString(),
              },
            }
          );

          await db.collection("account").updateOne(
            { _id: ObjectId(otherUserId) },
            {
              $set: {
                currentMatch: insId.toString(),
              },
            }
          );
          return res.json({ message: "Game has started.", success: true });
        } else {
          return res.json({
            message: "Game has not started yet.",
            success: true,
          });
        }
      }
    } catch (e) {
      return res.json({ message: e, success: false });
    }
  }
}
