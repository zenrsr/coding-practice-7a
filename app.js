const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const camelCase = (obj) => {
  var newObj = {};
  for (d in obj) {
    if (obj.hasOwnProperty(d)) {
      newObj[
        d.replace(/(\_\w)/g, function (k) {
          return k[1].toUpperCase();
        })
      ] = obj[d];
    }
  }
  return newObj;
};
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3007, () => {
      console.log("Sever running at http://localhost/3007/");
    });
  } catch (e) {
    console.log(`${e.message}`);
  }
};
initialize();

// API 1
app.get("/players/", async (request, response) => {
  const getQuery = `SELECT * FROM player_details;`;
  try {
    const x = await db.all(getQuery);
    const result = x.map((each) => camelCase(each));
    response.send(result);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  try {
    const x = await db.get(getQuery);
    response.send(camelCase(x));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getQuery = `UPDATE player_details
    SET
        player_name = '${playerName}'
    WHERE 
        player_id = ${playerId};`;
  try {
    const x = await db.get(getQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  try {
    const x = await db.get(getQuery);
    response.send(camelCase(x));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
        SELECT match_details.match_id,match_details.match,match_details.year FROM match_details INNER JOIN player_match_score ON match_details.match_id = player_match_score.match_id
        WHERE player_match_score.player_id = ${playerId}
    ;`;
  try {
    const x = await db.all(getQuery);
    response.send(x.map((each) => camelCase(each)));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getQuery = `
    SELECT player_details.player_id, player_details.player_name 
    FROM player_details 
    JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
    JOIN match_details ON match_details.match_id = player_match_score.match_id 
    WHERE match_details.match_id = ${matchId};`;
  try {
    const x = await db.all(getQuery);
    response.send(x.map((each) => camelCase(each)));
  } catch (e) {
    console.log(`${e.message}`);
  }
});
// API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
    SELECT 
    player_details.player_id as playerId,
    player_details.player_name as playerName,
    sum(player_match_score.score) as totalScore,
    sum(player_match_score.fours) as totalFours,
    sum(player_match_score.sixes) as totalSixes
    FROM player_details JOIN player_match_score
    ON player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
  try {
    const x = await db.get(getQuery);
    response.send(x);
  } catch (e) {
    console.log(`${e.message}`);
  }
});
module.exports = app;
