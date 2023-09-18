require('dotenv').config()
const express = require('express');
const app = express(); 
app.use(express.json());
const mongoose = require('mongoose');
const apiRouter = require("./routes/api-router");

app.use("/api", apiRouter)

mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
});
const db = mongoose.connection
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'))


module.exports = app; 