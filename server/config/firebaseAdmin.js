const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');
const { getDatabase } = require('firebase-admin/database');

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  databaseURL:
    'https://xchat-9abaf-default-rtdb.asia-southeast1.firebasedatabase.app',
});

// Export the auth service
module.exports = { auth: getAuth(adminApp), database: getDatabase(adminApp) };
