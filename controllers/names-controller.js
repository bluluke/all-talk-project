const {readNames} = require('../models/names-model');

exports.getNames = (req, res, next) => {
    readNames().then((data) => {
        res.status(200).send({ names: data})
    })
}