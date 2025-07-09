const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // чтобы разрешить запросы с клиента

const uri = "mongodb+srv://alexxkolcc:nTCZhATICeXfoSAr@duckcluster.h8flirt.mongodb.net/?retryWrites=true&w=majority&appName=DuckCluster";
const client = new MongoClient(uri);

app.get('/get-by-name', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('DuckQuestDB');

        // Найдём пользователя admin
        const user = await db.collection('Users').findOne({ username: 'admin' });

        res.json({ success: true, user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    } finally {
        await client.close(); // ⚠️ Это закроет соединение — лучше не закрывать каждый раз
    }
});

app.listen(3000, () => console.log('Server started on port 3000'));