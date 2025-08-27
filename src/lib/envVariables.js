require('dotenv').config();

const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;
const MONGODB_URI_DEV = process.env.MONGODB_URI_DEV;
const JWT_SECRET = process.env.JWT_SECRET;

let MONGODB_URI;

if (process.env.NODE_ENV === 'production') {
  MONGODB_URI = MONGODB_URI_PROD;
} else {
  MONGODB_URI = MONGODB_URI_DEV;
}

module.exports = {
  MONGODB_URI,
  JWT_SECRET
};
