const { is } = require('express/lib/request');
const {readChats, addChat, readSingleChat} = require('../models/chats-model')
const { ObjectId } = require("mongodb");

exports.getChats = (req, res, next) => {
    const fromDate = req.query.from_date;
    const fromDateNumber = Number(fromDate);
    const toDate = req.query.to_date;
    const toDateNumber = Number(toDate);

    if(isNaN(fromDateNumber) && fromDate || isNaN(toDateNumber) && toDate) {
       return next({ status: 400, msg: "Bad Request"});
    }
    readChats(fromDateNumber, toDateNumber)
    .then((data) => {
        res.status(200).send( {chats: data});
    })
}


exports.postChat = (req, res, next) => {
    const {chatName, chatCreator} = req.body;
    const nonWhitespaceRegex = /\S/;
    const nonWhitespaceCharacterInChatName = nonWhitespaceRegex.test(chatName)
    const nonWhitespaceCharacterInChatCreator = nonWhitespaceRegex.test(chatCreator)
    if(!chatName || !chatCreator || !nonWhitespaceCharacterInChatName || !nonWhitespaceCharacterInChatCreator) {
        return next({ status: 400, msg: "Bad Request"})
    }
    addChat(chatName, chatCreator)
    .then((data) => {
        res.status(201).send({ result: data }) 
    })
}

exports.getSingleChat = (req, res, next) => {
    const chatId = req.params.chatid;
    const isValidId = ObjectId.isValid(chatId);
    if(!isValidId) {
        return next({ status: 400, msg: 'Bad Request'})
    }
    readSingleChat(chatId).then((data) => {
        if(data === null) {
            return next ({ status: 404, msg: 'Not Found'})
        }
        res.status(200).send({ chat: data })
    })
}