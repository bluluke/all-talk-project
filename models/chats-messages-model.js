const { connectToDatabase } = require('../connection')
const { ObjectId } = require("mongodb");
const mongoose = require('mongoose');
const NewMessage = require('../schema/new-message-schema.js')

exports.addMessage = async (senderName, messageContent, chatId) => {

    const currentTimestamp = Date.now(); 
       const newMessage = new NewMessage({
        id: new ObjectId().toString(),
        senderName,
        timeOfSending:  {"$timestamp":{"t": currentTimestamp,"i":0}},
        messageContent,
    })
    try {
        await connectToDatabase()
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list')

        const result = await chatListCollection.updateOne(
          { _id: chatId },
          { $push: {messages: newMessage }}
        );
        return result;
      } catch(err) {
          console.error('Error:', err);
      }
}


exports.removeMessage = async (chatId, messageId) => {

    try {
      await connectToDatabase();
      const client = mongoose.connection.client;
      const database = await client.db('all-talk-project')
      const chatListCollection = await database.collection('chat-list');
      
      const chatDeletion = await chatListCollection.updateOne(
        { _id: chatId},
        { $pull: { messages: { _id: messageId }}}
      )
        return chatDeletion;
    } catch (err) {

    }
}

exports.updateMessage = async (chatId, messageId, messageContent) => {
  try {
    await connectToDatabase()
    const client = mongoose.connection.client
    const database = await client.db('all-talk-project')
    const chatListCollection = await database.collection('chat-list');

    const chatUpdate = await chatListCollection.updateOne(
      { _id: chatId, 'messages._id': messageId },
      { $set: { 'messages.$.messageContent': messageContent}}
    );
    return chatUpdate;

  } catch (err) {

  }
}










