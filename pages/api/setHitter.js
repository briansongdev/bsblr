import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bsblDB");
  let isAuthenticated = false,
    players,
    lineup;
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
            players = u.players;
            lineup = u.lineup;
          }
        }
      });
    if (
      isAuthenticated &&
      players
        .map((s) => JSON.stringify(s))
        .some((s) => s == req.body.hitterToChange)
    ) {
      // check if hitter already in lineup; if so, swap them
      let indToChange = -1;
      for (let i = 0; i < lineup.length; i++) {
        if (
          JSON.stringify(lineup[i]) == req.body.hitterToChange &&
          i != req.body.hitterIndex
        ) {
          indToChange = i;
        }
      }
      if (indToChange == -1) {
        lineup[req.body.hitterIndex] = JSON.parse(req.body.hitterToChange);
        await db.collection("account").updateOne(
          { email: req.body.email },
          {
            $set: {
              lineup: lineup,
            },
          }
        );
        res.json({ message: "No swap.", success: true });
      } else {
        // swap them
        const swap =
          (x, y) =>
          ([...xs]) =>
            xs.length > 1 ? (([xs[x], xs[y]] = [xs[y], xs[x]]), xs) : xs;
        const swappedLineup = swap(req.body.hitterIndex, indToChange);
        const nextLineup = swappedLineup(lineup);
        await db.collection("account").updateOne(
          {
            email: req.body.email,
          },
          {
            $set: {
              lineup: nextLineup,
            },
          }
        );
        res.json({ message: "Swapped two players.", success: true });
      }
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
}
