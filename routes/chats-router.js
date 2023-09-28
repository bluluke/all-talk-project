const chatsRouter = require("express").Router();
const {getChats, postChat} = require('../controllers/chats-controller')
const {postMessage} = require('../controllers/chats-messages-controller')
chatsRouter.route("/").get(getChats).post(postChat);
chatsRouter.route("/:chatid/messages").post(postMessage)
module.exports = chatsRouter;