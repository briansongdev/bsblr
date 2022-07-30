import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bsblDB");
  let isAuthenticated = false,
    isFriend = false;
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
          if (u.friends.includes(req.body.friendUsername)) isFriend = true;
        }
      });
    if (isAuthenticated) {
      // delete reqs and friendreqs (lol)
      await db
        .collection("account")
        .findOne({ username: req.body.username })
        .then(async (u) => {
          if (u) {
            if (
              u.friends.includes(req.body.friendUsername) ||
              u.friendReqs.includes(req.body.friendUsername)
            ) {
              // add as friend
              await db.collection("account").updateOne(
                { username: req.body.username },
                {
                  $pull: {
                    friends: req.body.friendUsername,
                    friendReqs: req.body.friendUsername,
                  },
                }
              );
              await db.collection("account").updateOne(
                { username: req.body.friendUsername },
                {
                  $pull: {
                    friends: req.body.username,
                    friendReqs: req.body.username,
                  },
                }
              );
              res.json({
                message: "Removed successfully.",
                success: true,
              });
            } else {
              res.json({
                message: "Invalid request. Try again.",
                success: false,
              });
            }
          } else {
            res.json({
              message: "Invalid request.",
              success: false,
            });
          }
        });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
}
