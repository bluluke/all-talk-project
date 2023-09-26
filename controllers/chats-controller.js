const {readChats} = require('../models/chats-model')

exports.getChats = (req, res, next) => {
    const fromDate = Number(req.query.from_date);
    readChats(fromDate)
    .then((data) => {
        res.status(200).send( {chats: data});
    })
}


