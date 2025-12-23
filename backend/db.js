const mongoose = require('mongoose');
const Trie = require('./trie');
require('dotenv').config({ path: __dirname + '/.env' });

//trie en memoria
const trie = new Trie();

//conexion a mongo atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas conectado"))
    .catch(err => {
        console.error("Error conectando a MongoDB:", err.message);
        process.exit(1);
    });


const streamerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    followers: {
        type: Number,
        required: true,
        default: 0
    }
});

const Streamer = mongoose.model('Streamer', streamerSchema);

// ===== Cargar streamers y construir el trie =====
async function loadTrie() {
    try {
        const streamers = await Streamer.find({});
        streamers.forEach(s => {
            trie.insert(s.name, s.followers);
        });
        console.log(`Trie cargado con ${streamers.length} streamers.`);
    } catch (err) {
        console.error("Error cargando streamers:", err.message);
    }
}

// Ejecutar al iniciar
loadTrie();

// ===== Exportaciones =====
module.exports = {
    Streamer,
    trie
};
