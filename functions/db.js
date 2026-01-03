const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: "nellorieans.appspot.com",
  });
}

const db = getFirestore();

module.exports = {
  admin,
  db,
  FieldValue, // ✅ EXPORT THIS
};
