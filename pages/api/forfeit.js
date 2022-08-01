import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bsblDB");
  let isAuthenticated = false,
    gameid;
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
            gameid = u.currentMatch;
          }
        }
      });
    if (isAuthenticated) {
      await db.collection("games").updateOne(
        { _id: ObjectId(gameid) },
        {
          $set: {
            currentInning: 9,
            isTopInning: false,
            outs: 3,
            countdown: 0,
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
