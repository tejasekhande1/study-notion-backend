const express = require("express");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.use(express.json());

const { dbConnect } = require("./config/database");
dbConnect();

app.listen(PORT, () => {
  console.log("Server Listening at ", PORT);
});
