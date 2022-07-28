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
    await db.collection("queue").deleteOne({ uid: req.body.uid });
    res.json({ success: true });
  }
  res.json({ success: false });
}
