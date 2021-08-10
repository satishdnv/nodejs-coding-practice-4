const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbpath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all player
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id;`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(playerArray);
});

//post a player
app.post("/players/", async (request, response) => {
  const playerBody = request.body;
  const { playerName, jerseyNumber, role } = playerBody;

  const addPlayerQuery = `insert into cricket_team (player_name,jersey_number,role) values(
      '${playerName}',
       ${jerseyNumber},
      '${role}'
  );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//get single player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;

  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
