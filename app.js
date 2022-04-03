require("dotenv").config();

const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const HttpError = require("./models/http-error");
const userRoutes = require("./routes/user-routes");
const hallRoutes = require("./routes/hall-routes");
const res = require("express/lib/response");
const connectDB = require("./db/connect");

const app = express();
const server = require("http").Server(app);

app.use(bodyParser.json());

app.use(cors());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use("/api/user", userRoutes);

app.use("/api/hall", hallRoutes);

app.use("/", (req, res) => {
  console.log("hello from main");
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
  if (req.file) {
    // delete uploaded image if there is an error
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

const port = process.env.PORT || 5000;
const url = process.env.MONGO_URI;

const start = async () => {
  try {
    await connectDB(url);
    server.listen(port, (req, res) => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
