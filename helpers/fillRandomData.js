const Hall = require("../models/hall");
const mongoose = require("mongoose");

const getRandom = (from, to, fixed) => {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
};

const randomImages = [
  "images/ztz4sioysmomhknwihh6.jpg",
  "images/dmwsjtafm7xagdf3ryut.jpg",
  "images/drdkwcvwkbgk7wgefitw.jpg",
  "images/gxc0rhqhnya0u0b3mbqu.jpg",
  "images/ghlc5nijluyuohkpwfwz.jpg",
  "images/xlleadggyjn36rpsvwow.jpg",
  "images/jqhabue9aiu9s2vynttf.jpg",
  "images/fwgjmznaa65krx3rj37g.jpg",
  "images/jqsjdf2o7hk0kwzywfai.jpg",
  "images/n65abgz0nycoqjrxyypd.jpg",
  "images/oy171ymafcurppfukuup.jpg",
];

const getRandomImages = () => {
  const shuffled = randomImages.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const getRandomName = () => {
  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const fillData = async (req, res, next) => {
  const randomHalls = (() => {
    const generatedHalls = [];
    for (i = 0; i < 10000; i++) {
      const createdHall = new Hall({
        hallName: getRandomName(),
        email: `${getRandomName()}@gmail.com`,
        address: "random address",
        mobileNumber: `+${(Math.random() * 1000000000).toFixed(0)}`,
        price: getRandom(1, 30, 0),
        location: {
          lat: getRandom(-90, 90, 15),
          lng: getRandom(-180, 180, 15),
        },
        images: getRandomImages(),
        bookings: [],
        ownerId: mongoose.Types.ObjectId(),
        chatRooms: [],
      });

      generatedHalls.push(createdHall);
    }

    return generatedHalls;
  })();

  try {
    await Hall.insertMany(randomHalls);
    console.log("added successfully");
  } catch (err) {
    console.log(err);
  }
};

module.exports = { fillData };
