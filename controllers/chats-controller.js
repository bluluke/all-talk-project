const {readChats} = require('../models/chats-model')

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


