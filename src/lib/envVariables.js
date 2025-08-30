// src/lib/envVariables.ts
import 'dotenv/config'; // replaces require('dotenv').config()

const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;
const MONGODB_URI_DEV = process.env.MONGODB_URI_DEV;
const JWT_SECRET = process.env.JWT_SECRET;

const MONGODB_URI = process.env.NODE_ENV === 'production' ? MONGODB_URI_PROD : MONGODB_URI_DEV;
const adminPassword = process.env.password;

export { MONGODB_URI, JWT_SECRET, adminPassword };
