const {readChats} = require('../models/chats-model')

exports.getChats = (req, res, next) => {
    const from_date = req.query.from_date;
    const fromDateNumber = Number(from_date);
    if(isNaN(fromDateNumber) && from_date) {
       return next({ status: 400, msg: "Bad Request"});
    }
    readChats(fromDateNumber)
    .then((data) => {
        res.status(200).send( {chats: data});
    })
}


