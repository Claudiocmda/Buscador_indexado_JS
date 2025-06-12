// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const Trie = require('./trie');
const path = require('path');

const dbPath = path.join(__dirname, '../streamers.db');
const db = new sqlite3.Database(dbPath);
const trie = new Trie();

// Cargar streamers desde la base de datos y construir el trie



db.all("SELECT name, followers FROM streamers",[], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }

    rows.forEach(row => {
        trie.insert(row.name, row.followers);
    });

    console.log("Trie cargado con"+ rows.length + "streamers.");
});

module.exports = { db, trie };
