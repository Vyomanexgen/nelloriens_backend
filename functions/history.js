const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

const { getFirestore, FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();
const historyCollection = db.collection("history_sections");

// -----------------------------------------------------
// CREATE
// -----------------------------------------------------
exports.createHistorySection = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        title,
        subtitle,
        description,
        imageUrl,
        year,
        order,
        tags,
        createdBy,
      } = req.body || {};

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const sectionData = {
        title,
        subtitle: subtitle || "",
        description: description || "",
        imageUrl: imageUrl || "",
        year: year || "",
        order: order || 0,
        tags: Array.isArray(tags) ? tags : [],
        createdBy: createdBy || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await historyCollection.add(sectionData);
      res.json({ success: true, id: ref.id });
    } catch (err) {
      console.error("Create history error:", err);
      res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  });
});

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
exports.updateHistorySection = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id, ...updates } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Section ID required" });
      }

      updates.updatedAt = FieldValue.serverTimestamp();
      await historyCollection.doc(id).update(updates);

      res.json({ success: true });
    } catch (err) {
      console.error("Update history error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
exports.deleteHistorySection = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Section ID required" });
      }

      await historyCollection.doc(id).delete();
      res.json({ success: true });
    } catch (err) {
      console.error("Delete history error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// GET ALL
// -----------------------------------------------------
exports.getHistory = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snap = await historyCollection.orderBy("order", "asc").get();

      const sections = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ success: true, history: sections });
    } catch (err) {
      console.error("Get history error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// GET ONE
// -----------------------------------------------------
exports.getHistorySection = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Section ID required" });
      }

      const doc = await historyCollection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "History section not found" });
      }

      res.json({
        success: true,
        section: { id: doc.id, ...doc.data() },
      });
    } catch (err) {
      console.error("Get history section error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
