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
    let tickets = 0;
    // check valid authentication, if username and passwords count. then check if id is in queue right now
    await db
      .collection("account")
      .findOne({ email: req.body.email })
      .then((u) => {
        if (u) {
          if (u.password == req.body.password) {
            // authenticated
            isAuthenticated = true;
            tickets = u.tickets;
          }
        }
      });
    if (isAuthenticated) {
      let ticketsToAdd = Math.floor(
        (JSON.parse(req.body.playerToRemove).pitchCom +
          JSON.parse(req.body.playerToRemove).fieldCom +
          JSON.parse(req.body.playerToRemove).strength) /
          2
      );
      await db.collection("account").updateOne(
        { email: req.body.email },
        {
          $pull: {
            players: JSON.parse(req.body.playerToRemove),
          },
          $set: {
            tickets: tickets + ticketsToAdd,
          },
        }
      );
      res.json({ message: "Gained " + ticketsToAdd + " tickets." });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
}
