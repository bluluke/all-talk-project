const apiRouter = require("express").Router();
const chatsRouter = require("./chats-router");
apiRouter.use("/chats", chatsRouter)
module.exports = apiRouter;