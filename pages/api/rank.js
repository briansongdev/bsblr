import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bsblDB");
  if (req.method == "POST") {
    await db
      .collection("account")
      .findOne({ username: req.body.usern })
      .then((u) => {
        if (u) {
          if (u.elo >= 0 && u.elo < 200)
            res.json({
              name: "RUSTY",
              color: "#a08679",
            });
          else if (u.elo >= 200 && u.elo < 400)
            res.json({
              name: "STEELED",
              color: "#c0c0c0",
            });
          else if (u.elo >= 400 && u.elo < 600)
            res.json({
              name: "GOLDEN",
              color: "#d4af37",
            });
          else if (u.elo >= 600 && u.elo < 800)
            res.json({
              name: "EMERALD",
              color: "#34ac90",
            });
          else if (u.elo >= 800 && u.elo < 1000)
            res.json({
              name: "PRISMATIC",
              color: "#a890fe",
            });
          else {
            res.json({
              name: "SHIMMERING",
              color: "highRankIcon",
            });
          }
        }
      });
  } else {
    res.json({ success: false });
  }
}
