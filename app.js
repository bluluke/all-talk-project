require('dotenv').config();
const express = require('express');
const app = express(); 
app.use(express.json());
const apiRouter = require("./routes/api-router");
app.use("/api", apiRouter)

app.all("*", (req, res) => {
  res.status(404).send({ status: 404, msg: "Not Found" });
});

  app.use((err, req, res, next) => {
    if (err.status && err.msg) {
      res.status(err.status).send({ msg: err.msg });
    }
    return next(err);
  });


module.exports = {app}; 











