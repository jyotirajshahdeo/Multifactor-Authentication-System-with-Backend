const dotenv = require('dotenv');

dotenv.config(); 

// Ensure ORIGIN is always a string and handle potential undefined values
const ORIGIN = (process.env.ORIGIN || "http://localhost:5173").toString();

module.exports = {
    PORT: process.env.PORT,
    RP_ID: process.env.RP_ID,
    ORIGIN: ORIGIN,
    RP_NAME: process.env.RP_NAME
}