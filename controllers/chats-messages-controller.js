const { addMessage, removeMessage, updateMessage } = require('../models/chats-messages-model')
const { ObjectId } = require("mongodb");


exports.postMessage = (req, res, next) => {
    const {senderName, messageContent, _id, timeOfSending} = req.body;

    const alphanumericRegex = /[^0-9a-z]/
    const numericRegex = /[^0-9]/; 
    const nonWhitespaceRegex = /\S/
    
    const chatId = req.params.chatid;
    const isChatIdValid = ObjectId.isValid(chatId);
    const chatIdContainsInvalidCharacters = alphanumericRegex.test(chatId)

    const isMessageIdValid = ObjectId.isValid(_id)
    const messageIdContainsInvalidCharacters  = alphanumericRegex.test(_id);

    const timeOfSendingSeconds = timeOfSending.$timestamp.t
    const timeOfSendingSecondsContainsInvalidCharacters = numericRegex.test(timeOfSendingSeconds.toString())
    
    const nonWhitespaceCharacterInsenderName = nonWhitespaceRegex.test(senderName);
    const nonWhiteSpaceCharcterInMessageContent = nonWhitespaceRegex.test(messageContent);
    const isSenderNameAString = typeof senderName === 'string';
    const isMessageContentAString = typeof messageContent === 'string';
    
    if(chatIdContainsInvalidCharacters || !isChatIdValid || chatId.length !== 24 || messageIdContainsInvalidCharacters || !isMessageIdValid || _id.length !== 24 || timeOfSendingSecondsContainsInvalidCharacters || !senderName
        || !messageContent || !nonWhitespaceCharacterInsenderName || !nonWhiteSpaceCharcterInMessageContent || !isSenderNameAString || !isMessageContentAString) {
        return next({ status: 400, msg: "Bad Request"});
    }

    addMessage(senderName, messageContent, chatId, _id, timeOfSendingSeconds)
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
    const nonWhitespaceRegex = /\S/
    const messageContentHasNoWhitespaceCharacter = nonWhitespaceRegex.test(messageContent);
    const isMessageContentString = typeof messageContent === 'string';

    if(!ObjectId.isValid(chatId) || !ObjectId.isValid(messageId) || !messageContent || !messageContentHasNoWhitespaceCharacter || !isMessageContentString) {
        return next({ status: 400, msg: 'Bad Request' })
    }
    updateMessage(chatId, messageId, messageContent).then((data) => {
        if(data.matchedCount === 0) {
            return next({ status: 404, msg: 'Not Found'})
        }
        res.status(200).send({ result: data })
    })
  }