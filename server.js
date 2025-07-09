const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://alexxkolcc:nTC@duckcluster.h8flirt.mongodb.net/?retryWrites=true&w=majority&appName=DuckCluster";
const client = new MongoClient(uri);

let db;

async function start() {
    try {
        await client.connect();
        db = client.db('DuckQuestDB');

        // Определяем порт здесь, перед запуском сервера
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.error('Failed to connect to DB', e);
    }
}

app.get('/get-by-name', async (req, res) => {
    try {
        const user = await db.collection('Users').findOne({ username: 'admin' });
        res.json({ success: true, user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
});

start();