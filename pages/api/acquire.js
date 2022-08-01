import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bsblDB");
  let isAuthenticated = false;
  if (req.method == "POST") {
    // Check tickets first.
    let tickets = 0;
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
      let pitcherNames = ["Mark", "Alex", "James", "Bright", "Leroy"],
        batterNames = [
          "Luke",
          "Eric",
          "Oscar",
          "Frank",
          "Aaron",
          "Nathan",
          "Brian",
          "Jacob",
          "Michael",
          "Daniel",
        ];
      if (req.body.isNormal) {
        if (tickets >= 20) {
          let playerType = Math.floor(Math.random() * 3 + 1),
            rarity = Math.floor(Math.random() * 100 + 1),
            strengthStat = Math.floor(Math.random() * 7 + 1),
            fourthStat = Math.floor(Math.random() * 7 + 1),
            fifthStat = Math.floor(Math.random() * 7 + 1);
          // Normal acquisitions
          // subtract tickets.
          await db.collection("account").updateOne(
            { email: req.body.email },
            {
              $set: {
                tickets: tickets - 20,
              },
            }
          );
          if (playerType < 2) {
            let randomName = pitcherNames[Math.floor(Math.random() * 5)];
            if (rarity <= 80) {
              // rare pitcher
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "P",
                      name: randomName,
                      pitchCom: fourthStat + 6,
                      fieldCom: fifthStat + 6,
                      strength: strengthStat + 6,
                    },
                  },
                }
              );
              res.json({
                position: "P",
                name: randomName,
                pitchCom: fourthStat + 6,
                fieldCom: fifthStat + 6,
                strength: strengthStat + 6,
              });
            } else if (rarity <= 95) {
              // epic pitcher
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "P",
                      name: randomName,
                      pitchCom: fourthStat + 9,
                      fieldCom: fifthStat + 9,
                      strength: strengthStat + 9,
                    },
                  },
                }
              );
              res.json({
                position: "P",
                name: randomName,
                pitchCom: fourthStat + 9,
                fieldCom: fifthStat + 9,
                strength: strengthStat + 9,
              });
            } else if (rarity <= 99) {
              // mythic pitcher
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "P",
                      name: randomName,
                      pitchCom: fourthStat + 18,
                      fieldCom: fifthStat + 18,
                      strength: strengthStat + 18,
                    },
                  },
                }
              );
              res.json({
                position: "P",
                name: randomName,
                pitchCom: fourthStat + 18,
                fieldCom: fifthStat + 18,
                strength: strengthStat + 18,
              });
            } else {
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "P",
                      name: randomName,
                      pitchCom: fourthStat + 29,
                      fieldCom: fifthStat + 29,
                      strength: strengthStat + 29,
                    },
                  },
                }
              );
              res.json({
                position: "P",
                name: randomName,
                pitchCom: fourthStat + 29,
                fieldCom: fifthStat + 29,
                strength: strengthStat + 29,
              });
            }
          } else {
            let randomName = batterNames[Math.floor(Math.random() * 10)];
            if (rarity <= 80) {
              // rare pitcher
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "IF/OF",
                      name: randomName,
                      pitchCom: 0,
                      fieldCom: fifthStat + 6,
                      strength: strengthStat + 6,
                    },
                  },
                }
              );
              res.json({
                position: "IF/OF",
                name: randomName,
                pitchCom: 0,
                fieldCom: fifthStat + 6,
                strength: strengthStat + 6,
              });
            } else if (rarity <= 95) {
              // epic pitcher
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "IF/OF",
                      name: randomName,
                      pitchCom: 0,
                      fieldCom: fifthStat + 9,
                      strength: strengthStat + 9,
                    },
                  },
                }
              );
              res.json({
                position: "IF/OF",
                name: randomName,
                pitchCom: 0,
                fieldCom: fifthStat + 9,
                strength: strengthStat + 9,
              });
            } else if (rarity <= 99) {
              // mythic pitcher
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "IF/OF",
                      name: randomName,
                      pitchCom: 0,
                      fieldCom: fifthStat + 18,
                      strength: strengthStat + 18,
                    },
                  },
                }
              );
              res.json({
                position: "IF/OF",
                name: randomName,
                pitchCom: 0,
                fieldCom: fifthStat + 18,
                strength: strengthStat + 18,
              });
            } else {
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "IF/OF",
                      name: randomName,
                      pitchCom: 0,
                      fieldCom: fifthStat + 29,
                      strength: strengthStat + 29,
                    },
                  },
                }
              );
              res.json({
                position: "IF/OF",
                name: randomName,
                pitchCom: 0,
                fieldCom: fifthStat + 29,
                strength: strengthStat + 29,
              });
            }
          }
        } else {
          res.json({
            message: "Insufficient tickets. Nice try.",
            success: false,
          });
        }
      }
      if (!req.body.isNormal) {
        if (tickets >= 50) {
          // Special acquisitions
          await db.collection("account").updateOne(
            { email: req.body.email },
            {
              $set: {
                tickets: tickets - 50,
              },
            }
          );
          let playerType = Math.floor(Math.random() * 2 + 1),
            nextPlayerType = Math.floor(Math.random() * 2 + 1),
            firstStat = Math.floor(Math.random() * 6),
            secondStat = Math.floor(Math.random() * 6),
            thirdStat = Math.floor(Math.random() * 6);

          if (playerType == 1) {
            let randomName = pitcherNames[Math.floor(Math.random() * 5)];
            // pitcher
            if (nextPlayerType == 1) {
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "P",
                      name: randomName,
                      pitchCom: firstStat + 35,
                      fieldCom: secondStat + 5,
                      strength: thirdStat + 5,
                    },
                  },
                }
              );
              res.json({
                position: "P",
                name: randomName,
                pitchCom: firstStat + 35,
                fieldCom: secondStat + 5,
                strength: thirdStat + 5,
              });
            } else {
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "P",
                      name: randomName,
                      pitchCom: firstStat + 10,
                      fieldCom: secondStat + 5,
                      strength: thirdStat + 25,
                    },
                  },
                }
              );
              res.json({
                position: "P",
                name: randomName,
                pitchCom: firstStat + 10,
                fieldCom: secondStat + 5,
                strength: thirdStat + 25,
              });
            }
          } else {
            let randomName = batterNames[Math.floor(Math.random() * 10)];
            // fielder
            if (nextPlayerType == 1) {
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "IF/OF",
                      name: randomName,
                      pitchCom: 0,
                      fieldCom: secondStat + 30,
                      strength: thirdStat + 10,
                    },
                  },
                }
              );
              res.json({
                position: "IF/OF",
                name: randomName,
                pitchCom: 0,
                fieldCom: secondStat + 10,
                strength: thirdStat + 30,
              });
            } else {
              await db.collection("account").updateOne(
                { email: req.body.email },
                {
                  $push: {
                    players: {
                      position: "IF/OF",
                      name: randomName,
                      pitchCom: 0,
                      fieldCom: secondStat + 10,
                      strength: thirdStat + 30,
                    },
                  },
                }
              );
              res.json({
                position: "IF/OF",
                name: randomName,
                pitchCom: 0,
                fieldCom: secondStat + 30,
                strength: thirdStat + 10,
              });
            }
          }
        } else {
          res.json({
            message: "Insufficient tickets. Nice try.",
            success: false,
          });
        }
      }
    } else {
      res.json({ message: "Unauthenticated.", success: false });
    }
  } else {
    res.json({ success: false });
  }
}
