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
      // if request in own account, automatically add to both friends list. or else, add to that person's friendReqs
      if (req.body.username == req.body.friendUsername)
        res.json({
          message: "You cannot add yourself as a friend!",
          success: false,
        });
      else {
        await db
          .collection("account")
          .findOne({ username: req.body.username })
          .then(async (u) => {
            if (u) {
              if (u.friendReqs.includes(req.body.friendUsername)) {
                // add as friend
                await db.collection("account").updateOne(
                  { username: req.body.username },
                  {
                    $addToSet: {
                      friends: req.body.friendUsername,
                    },
                    $pull: {
                      friendReqs: req.body.friendUsername,
                    },
                  }
                );
                await db.collection("account").updateOne(
                  { username: req.body.friendUsername },
                  {
                    $addToSet: {
                      friends: req.body.username,
                    },
                    $pull: {
                      friendReqs: req.body.username,
                    },
                  }
                );
                res.json({
                  message: "Added as friend successfully.",
                  success: true,
                });
              } else {
                await db
                  .collection("account")
                  .findOne({ username: req.body.friendUsername })
                  .then(async (res2) => {
                    if (res2) {
                      if (
                        isFriend &&
                        res2.friends.includes(req.body.username)
                      ) {
                        // already friends
                        res.json({
                          message: "Already friends.",
                          success: true,
                        });
                      } else {
                        await db.collection("account").updateOne(
                          { username: req.body.friendUsername },
                          {
                            $addToSet: {
                              friendReqs: req.body.username,
                            },
                          }
                        );
                        res.json({
                          message: "Sent request successfully.",
                          success: true,
                        });
                      }
                    } else {
                      res.json({
                        message:
                          "Couldn't find an account with this username. Try again.",
                        success: true,
                      });
                    }
                  });
              }
            } else {
              res.json({
                message: "Invalid request.",
                success: false,
              });
            }
          });
      }
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
}
