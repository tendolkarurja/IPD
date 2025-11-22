const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

mongoose.connect(MONGO_URL)
    .then(() => {console.log('DB connection successful');
        app.listen(PORT, () => {
                console.log(`🚀 Server is running on port ${PORT}`);
            });
        })
    .catch((err) => {console.error(err.message)});

app.get('/', (req, res) => {
    res.status(200).send('Carpool App Backend MVP is running.');
});

