const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const GMAIL_PASS = process.env.GMAIL_PASS;

module.exports = { port, MONGO_URI, GMAIL_PASS };
