const { addMessage } = require('../models/chats-messages-model')

exports.postMessage = (req, res, next) => {
    const {senderName, messageContent} = req.body;
    const chatId = req.params.chatid;

    addMessage(senderName, messageContent, chatId)
    .then((data) => {
        res.status(201).send({ result: data})
    })
}