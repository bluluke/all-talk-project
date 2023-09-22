const {readChats} = require('../models/chats-model')

exports.getChats = (req, res, next) => {
    readChats()
    .then((data) => {
        res.json(data);
    })
}


