const {readChats} = require('../models/chats-model')

exports.getChats = (req, res, next) => {
    const from_date = req.query.from_date;
    const fromDateNumber = Number(from_date);
    const toDate = req.query.to_date;
    const toDateNumber = Number(toDate);

    if(isNaN(fromDateNumber) && from_date || isNaN(toDateNumber) && toDate) {
       return next({ status: 400, msg: "Bad Request"});
    }
    readChats(fromDateNumber, toDateNumber)
    .then((data) => {
        res.status(200).send( {chats: data});
    })
}


