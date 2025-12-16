// backend/server.js
const express = require('express');
const path = require('path');
const { db,trie } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

// Endpoint para sugerencias
app.get('/sugerencias', (req, res) => {
    const query = req.query.query || "";
    const resultados = trie.searchPrefix(query);
    res.json(resultados);
});

const axios = require('axios');

require('dotenv').config({ path: __dirname + '/.env' });
console.log("API Key:", process.env.GOOGLE_API_KEY);
console.log("CX:", process.env.GOOGLE_CX);


const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; 
const GOOGLE_CX = process.env.GOOGLE_CX;

//Endpoint para la informacion de los streamer (se le pide a la api de google search)
app.get('/info', async (req, res) => {
    const streamer = req.query.streamer;
    if (!streamer) return res.status(400).json({ error: "Falta el parámetro 'streamer'" });

    try {
        console.log("Consultando Google API para:", streamer);
        console.log("GOOGLE_API_KEY:", GOOGLE_API_KEY ? "OK" : "FALTA");
        console.log("GOOGLE_CX:", GOOGLE_CX ? "OK" : "FALTA");

        const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_CX,
                q: streamer
            }
        });

        const items = response.data.items || [];
        const results = items.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            image: item.pagemap?.cse_image?.[0]?.src || null
        }));
        res.json(results);

    } catch (error) {
        console.error("Error consultando Google API:",error.response?.data || error.message);
        res.status(500).json({ 
            error: "Error al buscar información del streamer.",
            detalle: error.response?.data || error.message
        });
    }
});




//Endpoint delete , para borrar streamers de la base de datos 

app.delete('/streamers/:name', (req, res) => {
    const { name } = req.params;

    db.run(
        "DELETE FROM streamers WHERE name = ?",
        [name],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ msg: "Streamer no encontrado" });
            }

            

            res.json({
                msg: `Streamer '${name}' eliminado correctamente`
            });
        }
    );
});



// Endpoint para agregar followers a  streamers

app.put('/streamers/:name', (req, res) => {
    const { name } = req.params;
    const followers = req.body && req.body.followers;


    if (followers === undefined) {
        return res.status(400).json({ error: "followers es requerido" });
    }

    db.run(
        "UPDATE streamers SET followers = ? WHERE name = ?",
        [followers, name],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ msg: "Streamer no encontrado" });
            }

            // Actualizar el trie
            trie.insert(name, followers); // sobrescribe si ya existe

            res.json({
                msg: `Streamer '${name}' actualizado correctamente`,
                name,
                followers
            });
        }
    );
});











app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


//Ejecutar node server.js desde este archivo para correr toda la pagina
//E ingresar al puerto asignado