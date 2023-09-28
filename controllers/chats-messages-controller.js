const { addMessage } = require('../models/chats-messages-model')

exports.postMessage = (req, res, next) => {

    const {senderName, messageContent} = req.body;
    const chatId = req.params.chatid;
    const alphanumericRegex = /[^0-9a-z]/
    const nonWhitespaceRegex = /\S/
    const nonWhitespaceCharacterInsenderName = nonWhitespaceRegex.test(senderName);

    const containsInvalidCharacters = alphanumericRegex.test(chatId)
    if(containsInvalidCharacters || chatId.length !== 24 || !senderName
        || !messageContent || !nonWhitespaceCharacterInsenderName ) {
        return next({ status: 400, msg: "Bad Request"});
    }
    addMessage(senderName, messageContent, chatId)
    .then((data) => {
        res.status(201).send({ result: data})
    })
}
