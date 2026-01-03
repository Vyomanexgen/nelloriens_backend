const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const { db, FieldValue } = require("./db");

exports.adsCreateAd = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { title } = req.body || {};

      if (!title) {
        return res.status(400).json({
          error: "title is required",
        });
      }

      await db.collection("ads").add({
        title,
        createdAt: FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("createAd error:", err);
      res.status(500).json({ error: err.message });
    }
  });
});
