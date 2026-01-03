const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const { db, FieldValue } = require("./db");

/* TEST */
exports.testPing = onRequest((req, res) => {
  res.json({ success: true, message: "pong" });
});

/* ADS — INLINE (FINAL PROOF FIX) */
exports.adsCreateAd = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { title } = req.body || {};

      if (!title) {
        return res.status(400).json({ error: "title is required" });
      }

      await db.collection("ads").add({
        title,
        createdAt: FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

/* OTHER MODULES (UNCHANGED) */
exports.jobs = require("./jobs");
exports.news = require("./news");
exports.updates = require("./updates");
exports.notifications = require("./notifications");
exports.results = require("./results");
exports.sports = require("./sports");
exports.famousFoods = require("./famousFoods");
exports.famousStay = require("./famousStay");
exports.history = require("./history");
exports.commonAds = require("./commonAds");
exports.offers = require("./offers");
exports.media = require("./media");
exports.transport = require("./Transport");
exports.movies = require("./Movies");
