import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  let username = "";
  let iid1 = "",
    iid2 = "",
    elo1,
    elo2;
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
            username = u.username;
            elo1 = u.elo;
          }
        }
      });
    if (isAuthenticated) {
      let canAddMatch = true;
      let callBackMsg = "";
      await db
        .collection("games")
        .findOne({ _id: ObjectId(req.body.gameid) })
        .then(async (el) => {
          iid1 = el.player1;
          iid2 = el.player2;
          await db
            .collection("account")
            .findOne({ _id: ObjectId(iid2) })
            .then(async (newRes) => {
              elo2 = newRes.elo;
              if (el.countdown == 0) {
                await db
                  .collection("account")
                  .findOne({ email: req.body.email })
                  .then((als) => {
                    for (let i = 0; i < als.matchHistory.length; i++) {
                      if (als.matchHistory[i].gameId == req.body.gameid) {
                        canAddMatch = false;
                      }
                    }
                  });
                for (let i = 0; i < newRes.matchHistory.length; i++) {
                  if (newRes.matchHistory[i].gameId == req.body.gameid) {
                    canAddMatch = false;
                  }
                }
              }
            });
          let curr1Guess = el.p1currGuess,
            curr2Guess = el.p2currGuess;
          if (el.p1currGuess == -1) {
            if (el.isTopInning) {
              curr1Guess = -500;
            } else {
              curr1Guess = Math.floor(
                Math.random() * 2 * el.p1pitcher.pitchCom +
                  7 +
                  7 * el.p1pitcher.strength -
                  el.p1pitcher.pitchCom
              );
            }
          }
          if (el.p2currGuess == -1) {
            if (el.isTopInning) {
              curr2Guess = Math.floor(
                Math.random() * 2 * el.p2pitcher.pitchCom +
                  7 +
                  7 * el.p2pitcher.strength -
                  el.p2pitcher.pitchCom
              );
            } else {
              curr2Guess = -500;
            }
          }
          if (el.countdown == 0) {
            const average = (array) => {
              let avg = 0;
              for (let i = 0; i < array.length; i++) {
                avg += array[i].fieldCom;
              }
              return avg / array.length;
            };
            if (el.isTopInning) {
              // p1 is batting
              const randSeed = Math.random();
              if (randSeed > 0.4) {
                const score =
                  el.p1batters[el.currentBattingOrder % el.p1batters.length]
                    .strength -
                  el.p2pitcher.strength * 1.5 +
                  200 / (Math.abs(curr1Guess - curr2Guess) + 1) -
                  average(el.p2batters);
                if (score < 5) {
                  // swinging strike, determine if strikeout or not
                  if (el.strikes == 2) {
                    // strikeout
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " struck out!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          strikes: 0,
                          balls: 0,
                          outs: el.outs + 1,
                          currentBattingOrder: el.currentBattingOrder + 1,
                        },
                      }
                    );
                  } else {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " swung right through a strike!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          strikes: el.strikes + 1,
                        },
                      }
                    );
                  }
                } else if (score >= 5 && score < 10) {
                  if (el.balls == 3) {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " has walked!";
                    if (!el.manFirst) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            currentBattingOrder: el.currentBattingOrder + 1,
                            manFirst: true,
                          },
                        }
                      );
                    } else {
                      if (!el.manSecond) {
                        await db.collection("games").updateOne(
                          { _id: ObjectId(req.body.gameid) },
                          {
                            $set: {
                              balls: 0,
                              strikes: 0,
                              currentBattingOrder: el.currentBattingOrder + 1,
                              manSecond: true,
                            },
                          }
                        );
                      } else {
                        if (!el.manThird) {
                          await db.collection("games").updateOne(
                            { _id: ObjectId(req.body.gameid) },
                            {
                              $set: {
                                balls: 0,
                                strikes: 0,
                                currentBattingOrder: el.currentBattingOrder + 1,
                                manThird: true,
                              },
                            }
                          );
                        } else {
                          // bases are loaded, walk someone home.
                          callBackMsg =
                            el.p1batters[
                              el.currentBattingOrder % el.p1batters.length
                            ].name + " has walked in a run!";
                          await db.collection("games").updateOne(
                            { _id: ObjectId(req.body.gameid) },
                            {
                              $set: {
                                balls: 0,
                                strikes: 0,
                                currentBattingOrder: el.currentBattingOrder + 1,
                                p1runs: el.p1runs + 1,
                              },
                            }
                          );
                        }
                      }
                    }
                  } else {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " took a ball!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: el.balls + 1,
                          strikes: 0,
                        },
                      }
                    );
                  }
                } else if (score >= 10 && score < 40) {
                  // Single!
                  callBackMsg =
                    el.p1batters[el.currentBattingOrder % el.p1batters.length]
                      .name + " has singled to the outfield!";
                  if (el.manThird) {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " has singled, driving in a run!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentBattingOrder: el.currentBattingOrder + 1,
                          p1runs: el.p1runs + 1,
                          manThird: false,
                        },
                      }
                    );
                  }
                  // nobody scores, everybody moves up one
                  if (!el.manFirst) {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentBattingOrder: el.currentBattingOrder + 1,
                          manFirst: true,
                        },
                      }
                    );
                  } else {
                    // was somebody on first, move to second
                    if (!el.manSecond) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            currentBattingOrder: el.currentBattingOrder + 1,
                            manSecond: true,
                          },
                        }
                      );
                    } else {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            currentBattingOrder: el.currentBattingOrder + 1,
                            manThird: true,
                          },
                        }
                      );
                    }
                  }
                } else if (score >= 40 && score < 60) {
                  // double, second and third will score.
                  callBackMsg =
                    el.p1batters[el.currentBattingOrder % el.p1batters.length]
                      .name + " has doubled to the gap!";
                  let runn = 0;
                  if (el.manSecond) runn++;
                  if (el.manThird) runn++;
                  if (runn > 0) {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name +
                      " has doubled! " +
                      runn +
                      " runs have scored!";
                  }
                  if (!el.manFirst) {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentBattingOrder: el.currentBattingOrder + 1,
                          manSecond: true,
                          manThird: false,
                          p1runs: el.p1runs + runn,
                        },
                      }
                    );
                  } else {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentBattingOrder: el.currentBattingOrder + 1,
                          manSecond: true,
                          manThird: true,
                          manFirst: false,
                          p1runs: el.p1runs + runn,
                        },
                      }
                    );
                  }
                } else if (score >= 60 && score < 70) {
                  callBackMsg =
                    el.p1batters[el.currentBattingOrder % el.p1batters.length]
                      .name + " has tripled!";
                  let runn = 0;
                  if (el.manFirst) runn++;
                  if (el.manSecond) runn++;
                  if (el.manThird) runn++;
                  if (runn > 0) {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name +
                      " has tripled, driving in " +
                      runn +
                      " run(s)!";
                  }
                  await db.collection("games").updateOne(
                    { _id: ObjectId(req.body.gameid) },
                    {
                      $set: {
                        balls: 0,
                        strikes: 0,
                        currentBattingOrder: el.currentBattingOrder + 1,
                        manSecond: false,
                        manThird: true,
                        manFirst: false,
                        p1runs: el.p1runs + runn,
                      },
                    }
                  );
                } else {
                  let runn = 1;
                  if (el.manFirst) runn++;
                  if (el.manSecond) runn++;
                  if (el.manThird) runn++;
                  callBackMsg =
                    el.p1batters[el.currentBattingOrder % el.p1batters.length]
                      .name +
                    " has homered, adding " +
                    runn +
                    " more run(s)!";
                  await db.collection("games").updateOne(
                    { _id: ObjectId(req.body.gameid) },
                    {
                      $set: {
                        balls: 0,
                        strikes: 0,
                        currentBattingOrder: el.currentBattingOrder + 1,
                        manSecond: false,
                        manThird: false,
                        manFirst: false,
                        p1runs: el.p1runs + runn,
                      },
                    }
                  );
                }
              } else {
                if (randSeed > 0.2) {
                  // groundout, runner from third scores
                  if (el.manThird && el.outs < 2) {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " grounded out. Runner from third scores!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          outs: el.outs + 1,
                          manThird: false,
                          currentBattingOrder: el.currentBattingOrder + 1,
                          p1runs: el.p1runs + 1,
                        },
                      }
                    );
                  } else {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " grounded out.";
                    if (el.manSecond) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            outs: el.outs + 1,
                            manThird: true,
                            manSecond: false,
                            currentBattingOrder: el.currentBattingOrder + 1,
                          },
                        }
                      );
                    } else {
                      if (el.manFirst) {
                        await db.collection("games").updateOne(
                          { _id: ObjectId(req.body.gameid) },
                          {
                            $set: {
                              balls: 0,
                              strikes: 0,
                              outs: el.outs + 1,
                              manSecond: true,
                              manFirst: false,
                              currentBattingOrder: el.currentBattingOrder + 1,
                            },
                          }
                        );
                      } else {
                        await db.collection("games").updateOne(
                          { _id: ObjectId(req.body.gameid) },
                          {
                            $set: {
                              balls: 0,
                              strikes: 0,
                              outs: el.outs + 1,
                              currentBattingOrder: el.currentBattingOrder + 1,
                            },
                          }
                        );
                      }
                    }
                  }
                } else if (randSeed > 0.1) {
                  // flyout
                  if (el.manThird) {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " got a run in with a sacrifice fly!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          outs: el.outs + 1,
                          manThird: false,
                          currentBattingOrder: el.currentBattingOrder + 1,
                          p1runs: el.p1runs + 1,
                        },
                      }
                    );
                  } else {
                    callBackMsg =
                      el.p1batters[el.currentBattingOrder % el.p1batters.length]
                        .name + " flied out.";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          outs: el.outs + 1,
                          currentBattingOrder: el.currentBattingOrder + 1,
                        },
                      }
                    );
                  }
                } else {
                  // foulout
                  callBackMsg =
                    el.p1batters[el.currentBattingOrder % el.p1batters.length]
                      .name + " fouled out.";
                  await db.collection("games").updateOne(
                    { _id: ObjectId(req.body.gameid) },
                    {
                      $set: {
                        balls: 0,
                        strikes: 0,
                        outs: el.outs + 1,
                        currentBattingOrder: el.currentBattingOrder + 1,
                      },
                    }
                  );
                }
              }
            } else {
              // p1 is pitching
              const randSeed = Math.random();
              if (randSeed > 0.4) {
                const score =
                  el.p2batters[el.currentPitcherPower % el.p2batters.length]
                    .strength -
                  el.p1pitcher.strength * 1.5 +
                  200 / (Math.abs(curr1Guess - curr2Guess) + 1) -
                  average(el.p1batters);

                if (score < 5) {
                  // swinging strike, determine if strikeout or not
                  if (el.strikes == 2) {
                    // strikeout
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " struck out!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          strikes: 0,
                          balls: 0,
                          outs: el.outs + 1,
                          currentPitcherPower: el.currentPitcherPower + 1,
                        },
                      }
                    );
                  } else {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " swung right through a strike!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          strikes: el.strikes + 1,
                        },
                      }
                    );
                  }
                } else if (score >= 5 && score < 10) {
                  if (el.balls == 3) {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " has walked!";
                    if (!el.manFirst) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            currentPitcherPower: el.currentPitcherPower + 1,
                            manFirst: true,
                          },
                        }
                      );
                    } else {
                      if (!el.manSecond) {
                        await db.collection("games").updateOne(
                          { _id: ObjectId(req.body.gameid) },
                          {
                            $set: {
                              balls: 0,
                              strikes: 0,
                              currentPitcherPower: el.currentPitcherPower + 1,
                              manSecond: true,
                            },
                          }
                        );
                      } else {
                        if (!el.manThird) {
                          await db.collection("games").updateOne(
                            { _id: ObjectId(req.body.gameid) },
                            {
                              $set: {
                                balls: 0,
                                strikes: 0,
                                currentPitcherPower: el.currentPitcherPower + 1,
                                manThird: true,
                              },
                            }
                          );
                        } else {
                          // bases are loaded, walk someone home.
                          callBackMsg =
                            el.p2batters[
                              el.currentPitcherPower % el.p2batters.length
                            ].name + " has walked in a run!";
                          await db.collection("games").updateOne(
                            { _id: ObjectId(req.body.gameid) },
                            {
                              $set: {
                                balls: 0,
                                strikes: 0,
                                currentPitcherPower: el.currentPitcherPower + 1,
                                p2runs: el.p2runs + 1,
                              },
                            }
                          );
                        }
                      }
                    }
                  } else {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " took a ball!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: el.balls + 1,
                          strikes: 0,
                        },
                      }
                    );
                  }
                } else if (score >= 10 && score < 40) {
                  // Single!
                  callBackMsg =
                    el.p2batters[el.currentPitcherPower % el.p2batters.length]
                      .name + " has singled to the outfield!";
                  if (el.manThird) {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentPitcherPower: el.currentPitcherPower + 1,
                          p2runs: el.p2runs + 1,
                          manThird: false,
                        },
                      }
                    );
                  }
                  // nobody scores, everybody moves up one
                  if (!el.manFirst) {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentPitcherPower: el.currentPitcherPower + 1,
                          manFirst: true,
                        },
                      }
                    );
                  } else {
                    // was somebody on first, move to second
                    if (!el.manSecond) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            currentPitcherPower: el.currentPitcherPower + 1,
                            manSecond: true,
                          },
                        }
                      );
                    } else {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            currentPitcherPower: el.currentPitcherPower + 1,
                            manThird: true,
                          },
                        }
                      );
                    }
                  }
                } else if (score >= 40 && score < 60) {
                  // double, second and third will score.
                  callBackMsg =
                    el.p2batters[el.currentPitcherPower % el.p2batters.length]
                      .name + " has doubled to the gap!";
                  let runn = 0;
                  if (el.manSecond) runn++;
                  if (el.manThird) runn++;
                  if (runn > 0) {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name +
                      " has doubled! " +
                      runn +
                      " runs have scored!";
                  }
                  if (!el.manFirst) {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentPitcherPower: el.currentPitcherPower + 1,
                          manSecond: true,
                          manThird: false,
                          p2runs: el.p2runs + runn,
                        },
                      }
                    );
                  } else {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          currentPitcherPower: el.currentPitcherPower + 1,
                          manSecond: true,
                          manThird: true,
                          manFirst: false,
                          p2runs: el.p2runs + runn,
                        },
                      }
                    );
                  }
                } else if (score >= 60 && score < 70) {
                  callBackMsg =
                    el.p2batters[el.currentPitcherPower % el.p2batters.length]
                      .name + " has tripled!";
                  let runn = 0;
                  if (el.manFirst) runn++;
                  if (el.manSecond) runn++;
                  if (el.manThird) runn++;
                  if (runn > 0) {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name +
                      " has tripled, driving in " +
                      runn +
                      " run(s)!";
                  }
                  await db.collection("games").updateOne(
                    { _id: ObjectId(req.body.gameid) },
                    {
                      $set: {
                        balls: 0,
                        strikes: 0,
                        currentPitcherPower: el.currentPitcherPower + 1,
                        manSecond: false,
                        manThird: true,
                        manFirst: false,
                        p2runs: el.p2runs + runn,
                      },
                    }
                  );
                } else {
                  let runn = 1;
                  if (el.manFirst) runn++;
                  if (el.manSecond) runn++;
                  if (el.manThird) runn++;
                  callBackMsg =
                    el.p2batters[el.currentPitcherPower % el.p2batters.length]
                      .name +
                    " has homered, adding " +
                    runn +
                    " more run(s)!";
                  await db.collection("games").updateOne(
                    { _id: ObjectId(req.body.gameid) },
                    {
                      $set: {
                        balls: 0,
                        strikes: 0,
                        currentPitcherPower: el.currentPitcherPower + 1,
                        manSecond: false,
                        manThird: false,
                        manFirst: false,
                        p2runs: el.p2runs + runn,
                      },
                    }
                  );
                }
              } else {
                if (randSeed > 0.2) {
                  // groundout, runner from third scores
                  if (el.manThird) {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " grounded out. Runner from third scores!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          outs: el.outs + 1,
                          manThird: false,
                          currentPitcherPower: el.currentPitcherPower + 1,
                          p2runs: el.p2runs + 1,
                        },
                      }
                    );
                  } else {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " grounded out.";
                    if (el.manSecond) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            balls: 0,
                            strikes: 0,
                            outs: el.outs + 1,
                            manThird: true,
                            manSecond: false,
                            currentPitcherPower: el.currentPitcherPower + 1,
                          },
                        }
                      );
                    } else {
                      if (el.manFirst) {
                        await db.collection("games").updateOne(
                          { _id: ObjectId(req.body.gameid) },
                          {
                            $set: {
                              balls: 0,
                              strikes: 0,
                              outs: el.outs + 1,
                              manSecond: true,
                              manFirst: false,
                              currentPitcherPower: el.currentPitcherPower + 1,
                            },
                          }
                        );
                      }
                    }
                  }
                } else if (randSeed > 0.1) {
                  // flyout
                  if (el.manThird) {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " got a run in with a sacrifice fly!";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          outs: el.outs + 1,
                          manThird: false,
                          currentPitcherPower: el.currentPitcherPower + 1,
                          p2runs: el.p2runs + 1,
                        },
                      }
                    );
                  } else {
                    callBackMsg =
                      el.p2batters[el.currentPitcherPower % el.p2batters.length]
                        .name + " flied out.";
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          balls: 0,
                          strikes: 0,
                          outs: el.outs + 1,
                          currentPitcherPower: el.currentPitcherPower + 1,
                        },
                      }
                    );
                  }
                } else {
                  // foulout
                  callBackMsg =
                    el.p2batters[el.currentPitcherPower % el.p2batters.length]
                      .name + " fouled out.";
                  await db.collection("games").updateOne(
                    { _id: ObjectId(req.body.gameid) },
                    {
                      $set: {
                        balls: 0,
                        strikes: 0,
                        outs: el.outs + 1,
                        currentPitcherPower: el.currentPitcherPower + 1,
                      },
                    }
                  );
                }
              }
            }
            if (el.isTopInning) {
              await db.collection("games").updateOne(
                { _id: ObjectId(req.body.gameid) },
                {
                  $set: {
                    countdown: Math.floor(20000 / (elo1 + elo2 + 1000)),
                    p1currGuess: -1,
                    p2currGuess: -1,
                  },
                  $push: {
                    pastFewPitches: {
                      isTopInning: el.isTopInning,
                      guess1: curr1Guess,
                      guess2: curr2Guess,
                    },
                  },
                }
              );
            } else {
              await db.collection("games").updateOne(
                { _id: ObjectId(req.body.gameid) },
                {
                  $set: {
                    countdown: Math.floor(20000 / (elo1 + elo2 + 1000)),
                    p1currGuess: -1,
                    p2currGuess: -1,
                  },
                  $push: {
                    pastFewPitches: {
                      isTopInning: el.isTopInning,
                      guess1: curr2Guess,
                      guess2: curr1Guess,
                    },
                  },
                }
              );
            }
            await db
              .collection("games")
              .findOne({ _id: ObjectId(req.body.gameid) })
              .then(async (u) => {
                if (u.currentInning != 9) {
                  if (u.outs >= 3 && u.isTopInning) {
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          isTopInning: false,
                          outs: 0,
                          balls: 0,
                          strikes: 0,
                          manFirst: false,
                          manSecond: false,
                          manThird: false,
                          pastFewPitches: [],
                        },
                      }
                    );
                  } else {
                    if (u.outs >= 3) {
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            isTopInning: true,
                            currentInning: u.currentInning + 1,
                            outs: 0,
                            balls: 0,
                            strikes: 0,
                            manFirst: false,
                            manSecond: false,
                            manThird: false,
                            pastFewPitches: [],
                          },
                        }
                      );
                    }
                  }
                }
                if (u.outs >= 3 && u.currentInning == 9) {
                  if (u.isTopInning) {
                    if (u.p2runs >= u.p1runs && canAddMatch) {
                      let elo1,
                        elo2,
                        xp1,
                        xp2,
                        eloGain = 0,
                        eloLoss = 0;
                      await db
                        .collection("account")
                        .findOne({ _id: ObjectId(iid1) })
                        .then((bl) => {
                          elo1 = bl.elo;
                          xp1 = bl.exp;
                        });
                      await db
                        .collection("account")
                        .findOne({ _id: ObjectId(iid2) })
                        .then((bl) => {
                          elo2 = bl.elo;
                          xp2 = bl.exp;
                        });
                      if (u.isRanked) {
                        eloGain = Math.max(
                          30,
                          parseInt(
                            40 +
                              (elo1 - elo2) * 0.1 +
                              (u.p2runs - u.p1runs) * 0.05
                          )
                        );
                        eloLoss = parseInt(
                          50 +
                            (elo1 - elo2) * 0.1 +
                            (u.p2runs - u.p1runs) * 0.05
                        );
                        await db.collection("account").updateOne(
                          { _id: ObjectId(iid1) },
                          {
                            $set: {
                              elo: Math.max(0, elo1 - Math.max(1, eloLoss)),
                            },
                          }
                        );
                        await db.collection("account").updateOne(
                          { _id: ObjectId(iid2) },
                          {
                            $set: {
                              elo: elo2 + Math.max(0, eloGain),
                            },
                          }
                        );
                      }
                      await db.collection("account").updateOne(
                        { _id: ObjectId(iid1) },
                        {
                          $set: {
                            exp:
                              xp1 +
                              10 *
                                (u.currentPitcherPower + u.currentBattingOrder),
                            currentMatch: "",
                          },
                          $addToSet: {
                            matchHistory: {
                              gameId: req.body.gameid,
                              // completedOn: new Date(),
                              p1Score: u.p1runs,
                              p2Score: u.p2runs,
                              eloChange: -1 * Math.max(1, eloLoss),
                              winner: iid2,
                            },
                          },
                        }
                      );
                      await db.collection("account").updateOne(
                        { _id: ObjectId(iid2) },
                        {
                          $set: {
                            exp:
                              xp2 +
                              10 *
                                (u.currentPitcherPower + u.currentBattingOrder),
                            currentMatch: "",
                          },
                          $addToSet: {
                            matchHistory: {
                              gameId: req.body.gameid,
                              // completedOn: new Date(),
                              p1Score: u.p1runs,
                              p2Score: u.p2runs,
                              eloChange: Math.max(0, eloGain),
                              winner: iid2,
                            },
                          },
                        }
                      );
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            countdown: 0,
                          },
                        }
                      );
                      // Delete match, add match to match history, add exp
                    } else {
                      // move to bot9
                      await db.collection("games").updateOne(
                        { _id: ObjectId(req.body.gameid) },
                        {
                          $set: {
                            isTopInning: !u.isTopInning,
                            outs: 0,
                            balls: 0,
                            strikes: 0,
                            manFirst: false,
                            manSecond: false,
                            manThird: false,
                            pastFewPitches: [],
                          },
                        }
                      );
                    }
                  }
                }
                if (u.currentInning == 9 && !u.isTopInning) {
                  if (u.p2runs >= u.p1runs && canAddMatch) {
                    let elo1,
                      elo2,
                      xp1,
                      xp2,
                      eloGain = 0,
                      eloLoss = 0;
                    // Ties will count as the p2 winning. No overtime in matches.
                    await db
                      .collection("account")
                      .findOne({ _id: ObjectId(iid1) })
                      .then((bl) => {
                        elo1 = bl.elo;
                        xp1 = bl.exp;
                      });
                    await db
                      .collection("account")
                      .findOne({ _id: ObjectId(iid2) })
                      .then((bl) => {
                        elo2 = bl.elo;
                        xp2 = bl.exp;
                      });
                    if (u.isRanked) {
                      eloGain = Math.max(
                        30,
                        parseInt(
                          40 +
                            (elo1 - elo2) * 0.1 +
                            (u.p2runs - u.p1runs) * 0.05
                        )
                      );
                      eloLoss = parseInt(
                        50 + (elo1 - elo2) * 0.1 + (u.p2runs - u.p1runs) * 0.05
                      );
                      await db.collection("account").updateOne(
                        { _id: ObjectId(iid1) },
                        {
                          $set: {
                            elo: Math.max(0, elo1 - Math.max(1, eloLoss)),
                          },
                        }
                      );
                      await db.collection("account").updateOne(
                        { _id: ObjectId(iid2) },
                        {
                          $set: {
                            elo: elo2 + Math.max(0, eloGain),
                          },
                        }
                      );
                    }
                    await db.collection("account").updateOne(
                      { _id: ObjectId(iid1) },
                      {
                        $set: {
                          exp:
                            xp1 +
                            10 *
                              (u.currentPitcherPower + u.currentBattingOrder),
                          currentMatch: "",
                        },
                        $addToSet: {
                          matchHistory: {
                            gameId: req.body.gameid,
                            // completedOn: new Date(),
                            p1Score: u.p1runs,
                            p2Score: u.p2runs,
                            eloChange: -1 * Math.max(1, eloLoss),
                            winner: iid2,
                          },
                        },
                      }
                    );
                    await db.collection("account").updateOne(
                      { _id: ObjectId(iid2) },
                      {
                        $set: {
                          exp:
                            xp2 +
                            10 *
                              (u.currentPitcherPower + u.currentBattingOrder),
                          currentMatch: "",
                        },
                        $addToSet: {
                          matchHistory: {
                            gameId: req.body.gameid,
                            // completedOn: new Date(),
                            p1Score: u.p1runs,
                            p2Score: u.p2runs,
                            eloChange: Math.max(0, eloGain),
                            winner: iid2,
                          },
                        },
                      }
                    );
                    await db.collection("games").updateOne(
                      { _id: ObjectId(req.body.gameid) },
                      {
                        $set: {
                          countdown: 0,
                        },
                      }
                    );
                    // Delete match, add match to match history, add exp
                  } else {
                    if (canAddMatch) {
                      let xp1, xp2;
                      if (u.outs >= 3) {
                        //p1 wins
                        let elo1,
                          elo2,
                          eloGain = 0,
                          eloLoss = 0;
                        // Ties will count as the p2 winning. No overtime in matches.
                        await db
                          .collection("account")
                          .findOne({ _id: ObjectId(iid1) })
                          .then((bl) => {
                            elo1 = bl.elo;
                            xp1 = bl.exp;
                          });
                        await db
                          .collection("account")
                          .findOne({ _id: ObjectId(iid2) })
                          .then((bl) => {
                            elo2 = bl.elo;
                            xp2 = bl.exp;
                          });
                        if (u.isRanked) {
                          eloGain = Math.max(
                            30,
                            parseInt(
                              40 +
                                (elo2 - elo1) * 0.1 +
                                (u.p1runs - u.p2runs) * 0.05
                            )
                          );
                          eloLoss = parseInt(
                            50 +
                              (elo2 - elo1) * 0.1 +
                              (u.p1runs - u.p2runs) * 0.05
                          );
                          await db.collection("account").updateOne(
                            { _id: ObjectId(iid1) },
                            {
                              $set: {
                                elo: elo1 + Math.max(0, eloGain),
                              },
                            }
                          );
                          await db.collection("account").updateOne(
                            { _id: ObjectId(iid2) },
                            {
                              $set: {
                                elo: Math.max(0, elo2 - Math.max(1, eloLoss)),
                              },
                            }
                          );
                        }
                        await db.collection("account").updateOne(
                          { _id: ObjectId(iid1) },
                          {
                            $set: {
                              exp:
                                xp1 +
                                10 *
                                  (u.currentPitcherPower +
                                    u.currentBattingOrder),
                              currentMatch: "",
                            },
                            $addToSet: {
                              matchHistory: {
                                gameId: req.body.gameid,
                                // completedOn: new Date(),
                                p1Score: u.p1runs,
                                p2Score: u.p2runs,
                                eloChange: Math.max(0, eloGain),
                                winner: iid1,
                              },
                            },
                          }
                        );
                        await db.collection("account").updateOne(
                          { _id: ObjectId(iid2) },
                          {
                            $set: {
                              exp:
                                xp2 +
                                10 *
                                  (u.currentPitcherPower +
                                    u.currentBattingOrder),
                              currentMatch: "",
                            },
                            $addToSet: {
                              matchHistory: {
                                gameId: req.body.gameid,
                                // completedOn: new Date(),
                                p1Score: u.p1runs,
                                p2Score: u.p2runs,
                                eloChange: -1 * Math.max(1, eloLoss),
                                winner: iid1,
                              },
                            },
                          }
                        );
                        await db.collection("games").updateOne(
                          { _id: ObjectId(req.body.gameid) },
                          {
                            $set: {
                              countdown: 0,
                            },
                          }
                        );
                      }
                    }
                  }
                }
              });
            // Player 1 enqueued this request.
            // strike, ball, hit, groundout, flyout
            // hit:                  single, double, triple, home run,
            // if is a ball:
            // ball/swinging strike dependent on hitter's guess
            // if is a strike:
            // score = batterStrength - pitcherStrength * 1.5 + 300/(abs(pitcherGuess-batterGuess)+1) - avgLineupFieldCom
            // if < 5: swinging strike
            // if >= 5 and < 10: ball
            // if >= 10 and < 40: single
            // if >= 40 and < 60: double
            // if >= 60 and < 70: triple
            // if >= 70: homerun

            // check inning end and game ended yet
          } else {
            if (el.p1currGuess != -1 && el.p2currGuess != -1) {
              await db.collection("games").updateOne(
                { _id: ObjectId(req.body.gameid) },
                {
                  $set: {
                    countdown: 0,
                  },
                }
              );
            } else {
              await db.collection("games").updateOne(
                { _id: ObjectId(req.body.gameid) },
                {
                  $set: {
                    countdown: el.countdown - 1,
                  },
                }
              );
            }
          }
        });

      if (callBackMsg != "") {
        await db.collection("games").updateOne(
          { _id: ObjectId(req.body.gameid) },
          {
            $set: {
              feedback: callBackMsg,
            },
          }
        );
      }
      res.json({ success: true });
    } else {
      res.json({ message: "Unauthenticated.", success: false });
    }
  }
}
