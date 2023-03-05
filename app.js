require("dotenv").config();

const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const HttpError = require("./models/http-error");
const userRoutes = require("./routes/user.route");
const hallRoutes = require("./routes/hall.route");
const bookingRoutes = require("./routes/booking-routes");
const chatRoutes = require("./routes/chatRoom-routes");
const res = require("express/lib/response");
const connectDB = require("./db/connect");
const URL = require("./helpers/url");

const app = express();
const server = require("http").Server(app);

app.use(bodyParser.json());

app.use(cors());

const { Server } = require("socket.io");
const errorMiddleware = require("./middleware/error-middleware");
const notFound = require("./middleware/not-found");
const { MONGO_URI, port } = require("./config");
const io = new Server(server);

const socketCb = (key, socket) => {
  return socket.on(key, (cbObject) => {
    const stringObjectListener = Object.values(cbObject)[0];
    const data = Object.values(cbObject)[1];
    io.emit(stringObjectListener, data);
  });
};

io.on("connection", (socket) => {
  socketCb("reservation", socket);
  socketCb("sentMessage", socket);
  socketCb("newChatRoom", socket);
});

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/api/user", userRoutes);
app.use("/api/hall", hallRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/chat", chatRoutes);

app.use("/", (req, res) => {
  res.status(200).json({ message: "Main route" });
});

app.use(notFound);
app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDB(MONGO_URI);
    server.listen(port, (req, res) => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
