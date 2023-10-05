const chatsRouter = require("express").Router();
const {getChats, postChat} = require('../controllers/chats-controller')
const {postMessage} = require('../controllers/chats-messages-controller')
const {getNames} = require('../controllers/names-controller');
chatsRouter.route("/").get(getChats).post(postChat);
chatsRouter.route("/:chatid/messages").post(postMessage)
chatsRouter.route("/names").get(getNames)
module.exports = chatsRouter;