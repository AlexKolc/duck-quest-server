const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://alexxkolcc:nTCZhATICeXfoSAr@duckcluster.h8flirt.mongodb.net/?retryWrites=true&w=majority&appName=DuckCluster";
const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 5000,
});

let db;

async function startServer() {
    try {
        await client.connect();
        db = client.db('DuckQuestDB');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.error('Ошибка подключения к MongoDB:', e);
        process.exit(1);
    }
}

app.get('/get-user-by-name', async (req, res) => {
    try {
        const username = req.query.username;

        if (!username) {
            return res.status(400).json({ success: false, message: 'Не указано имя пользователя' });
        }

        const user = await db.collection('Users').findOne({ username });

        if (!user) {
            return res.json({ success: false, message: 'Пользователь не найден' });
        }

        res.json({ success: true, user });
    } catch (e) {
        console.error('Ошибка при поиске пользователя:', e);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/create-user', async (req, res) => {
    try {
        const { username } = req.body;

        const userObject = {
            username,
            found_ducks: []
        };

        const result = await db.collection('Users').insertOne(userObject);

        res.json({ success: true, user: { _id: result.insertedId, ...userObject } });
    } catch (e) {
        console.error('Ошибка при создании пользователя:', e);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/user-ducks/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const user = await db.collection('Users').findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        const foundDuckIds = user.found_ducks || [];

        // Конвертация строк в ObjectId
        const objectIdArray = foundDuckIds.map(id => new ObjectId(id));

        const allDucks = await db.collection('Ducks').find().toArray();

        const foundDucks = await db.collection('Ducks').find({
            _id: { $in: objectIdArray }
        }).toArray();

        const notFoundDucks = await db.collection('Ducks').find({
            _id: { $nin: objectIdArray }
        }).toArray();

        res.json({
            success: true,
            all: allDucks,
            found: foundDucks,
            notFound: notFoundDucks
        });

    } catch (e) {
        console.error('Ошибка при получении уток для пользователя:', e);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/add-duck', async (req, res) => {
    try {
        const { username, duckId } = req.body;

        const objectId = new ObjectId(duckId);

        const result = await db.collection('Users').updateOne(
            { username },
            { $addToSet: { found_ducks: objectId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        res.json({ success: true, message: 'Утка добавлена' });
    } catch (e) {
        console.error('Ошибка при добавлении утки:', e);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

startServer();