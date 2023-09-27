const chatsRouter = require("express").Router();
const {getChats, postChat} = require('../controllers/chats-controller')
chatsRouter.route("/").get(getChats).post(postChat);

module.exports = chatsRouter;