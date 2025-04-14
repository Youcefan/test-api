const express = require("express");
require("dotenv").config();
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const usersRouter = require("./Routes/usersRoutes");
var cors = require("cors");

mongoose
  .connect(process.env.Mongo_Url)
  .then(() => {
    console.log("connecting sucessfuly");
  })
  .catch((error) => {
    console.log("error" + error);
  });
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", usersRouter);
app.use((error, req, res, next) => { 
  res
    .status(error.statusCode || 500)
    .json({
      status: "Error",
      message: error.message,
      code: error.statusCode || 500,
      data: null,
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
