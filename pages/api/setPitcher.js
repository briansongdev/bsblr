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
      await db.collection("account").updateOne(
        { email: req.body.email },
        {
          $set: {
            currPitcher: JSON.parse(req.body.pitcherToChange),
          },
        }
      );
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
}
