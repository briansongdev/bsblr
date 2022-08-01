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
      let totalTicketsAdded = 0;
      await db
        .collection("account")
        .findOne({ email: req.body.email })
        .then(async (u) => {
          let sortedArr = u.levelRewards.sort();
          for (let i = 0; i <= Math.floor(u.exp / 1000) - 1; i++) {
            if (i >= sortedArr.length) {
              // not done yet, start collecting from here
              totalTicketsAdded += 10;
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    levelRewards: i + 1,
                  },
                  $set: {
                    tickets: u.tickets + 10,
                  },
                }
              );
            }
          }

          await db.collection("account").updateOne(
            { email: req.body.email },
            {
              $set: {
                tickets: u.tickets + totalTicketsAdded,
              },
            }
          );
        });
      if (totalTicketsAdded == 0) {
        res.json({
          message:
            "You have already claimed all available tickets. Keep leveling up and collect more!",
          success: true,
        });
      } else {
        res.json({
          message:
            totalTicketsAdded +
            " tickets added to your collection! Happy acquiring!",
          success: true,
        });
      }
    } else {
      res.json({ message: "Not authenticated.", success: false });
    }
  } else {
    res.json({ success: false });
  }
}
