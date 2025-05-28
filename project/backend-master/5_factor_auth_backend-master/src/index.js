const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

const app = express();

const { PORT } = require("./config/serverConfig");

const apiroutes = require("./routes/index");

const startserver = () => {

  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use("/api", apiroutes);

  app.listen(PORT, () => {
    console.log(`server started on port : ${PORT}`);
  });
};

startserver();