const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

// Collection
const fixturesCollection = db.collection("sports_fixtures");

// -------------------------------------------------------------
// CREATE FIXTURE
// -------------------------------------------------------------
exports.createFixture = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log("REQ BODY 👉", req.body);

      const { teamA, teamB, matchType, venue, matchDate, description } =
        req.body || {};

      if (!teamA || !teamB) {
        return res.status(400).json({ error: "Teams are required" });
      }

      let parsedDate = null;
      if (matchDate) {
        const d = new Date(matchDate);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ error: "Invalid matchDate" });
        }
        parsedDate = Timestamp.fromDate(d);
      }

      const fixtureData = {
        title: `${teamA} vs ${teamB}`,
        teamA,
        teamB,
        matchType: matchType || "",
        venue: venue || "",
        matchDate: parsedDate,
        description: description || "",
        status: "upcoming",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await fixturesCollection.add(fixtureData);

      return res.json({ success: true, id: ref.id });
    } catch (err) {
      console.error("❌ Error creating fixture:", err);
      return res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  });
});

// -------------------------------------------------------------
// GET FIXTURES
// -------------------------------------------------------------
exports.getFixtures = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snap = await fixturesCollection.orderBy("createdAt", "desc").get();

      const fixtures = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ success: true, fixtures });
    } catch (err) {
      console.error("Error fetching fixtures:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
