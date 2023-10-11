const { addMessage, removeMessage, updateMessage } = require('../models/chats-messages-model')
const { ObjectId } = require("mongodb");


exports.postMessage = (req, res, next) => {

    const {senderName, messageContent} = req.body;

    const alphanumericRegex = /[^0-9a-z]/
    const nonWhitespaceRegex = /\S/
    
    const chatId = req.params.chatid;
    const isChatIdValid = ObjectId.isValid(chatId);
    const idContainsInvalidCharacters = alphanumericRegex.test(chatId)

    const nonWhitespaceCharacterInsenderName = nonWhitespaceRegex.test(senderName);
    const nonWhiteSpaceCharcterInMessageContent = nonWhitespaceRegex.test(messageContent);
    const isSenderNameAString = typeof senderName === 'string';
    const isMessageContentAString = typeof messageContent === 'string';


    if(idContainsInvalidCharacters || !isChatIdValid || chatId.length !== 24 || !senderName
        || !messageContent || !nonWhitespaceCharacterInsenderName || !nonWhiteSpaceCharcterInMessageContent || !isSenderNameAString
         || !isMessageContentAString) {
        return next({ status: 400, msg: "Bad Request"});
    }

    addMessage(senderName, messageContent, chatId)
    .then((data) => {
        res.status(201).send({ result: data})
    })
  }


  exports.deleteMessage = (req, res, next) => {
    const chatId = req.params.chatid;
    const messageId = req.params.messageid;
    if(!ObjectId.isValid(chatId) || !ObjectId.isValid(messageId)) {
        return next({ status: 400, msg: 'Bad Request'})
    }
    removeMessage(chatId, messageId).then((data) => {
        if(data.modifiedCount === 0) {
            return next({ status: 404, msg: 'Not Found'})
        }
        res.status(200).send({ result: data })
    })
  }

  exports.patchMessage = (req, res, next) => {
    const chatId = req.params.chatid;
    const messageId = req.params.messageid;
    const { messageContent } = req.body;

    if(!ObjectId.isValid(chatId) || !ObjectId.isValid(messageId) || !messageContent) {
        return next({ status: 400, msg: 'Bad Request' })
    }
    updateMessage(chatId, messageId, messageContent).then((data) => {
        if(data.matchedCount === 0) {
            return next({ status: 404, msg: 'Not Found'})
        }
        res.status(200).send({ result: data })
    })
  }