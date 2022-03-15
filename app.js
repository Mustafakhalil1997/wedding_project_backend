require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const HttpError = require("./models/http-error");
const userRoutes = require("./routes/user-routes");
const res = require("express/lib/response");

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use("/api/user", userRoutes);

app.use("/", (req, res) => {
  res.json({ message: "Main route" });
});

// app.get("/", (req, res) => {
//   res.json({ message: "Hello world" });
// });

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

const port = process.env.PORT || 5000;

app.listen(port, (req, res) => {
  console.log(`Server is listening on port ${port}`);
});
