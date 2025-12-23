// backend/migrate_sqlite_to_mongo.js
const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

// Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch(err => console.error("Error Mongo:", err));

// Schema
const streamerSchema = new mongoose.Schema({
  name: String,
  followers: Number
});

const Streamer = mongoose.model('Streamer', streamerSchema);

// SQLite
const sqliteDb = new sqlite3.Database('../streamers.db');

sqliteDb.all("SELECT name, followers FROM streamers", async (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log("SQLite no tiene datos");
    process.exit(0);
  }

  try {
    await Streamer.insertMany(rows);
    console.log(`Migrados ${rows.length} streamers a MongoDB`);
  } catch (e) {
    console.error("Error insertando:", e.message);
  } finally {
    sqliteDb.close();
    mongoose.connection.close();
  }
});
