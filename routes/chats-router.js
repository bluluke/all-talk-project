const chatsRouter = require("express").Router();
const {getChats} = require('../controllers/chats-controller')
chatsRouter.route("/").get(getChats);

module.exports = chatsRouter;