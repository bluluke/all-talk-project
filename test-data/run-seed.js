const fs = require("fs/promises");
const mongoose = require('mongoose');
const { connectToDatabase } = require('../connection')


const seedDatabase = async () => {

    try {
        await connectToDatabase();

        const chatsData = await fs.readFile(`${__dirname}/chats.json`, "utf8");
        const parsedChatData = JSON.parse(chatsData);

        const client = mongoose.connection.client;
        const database = client.db('all-talk-project')
        const collection = database.collection('chat-list');

        await collection.deleteMany({});

        await collection.insertMany(parsedChatData);

        const collectionData = await collection.find({}).toArray();

    } catch (error) {
        console.log('Error seeding database:', error);
    } 
}


module.exports = seedDatabase; 

