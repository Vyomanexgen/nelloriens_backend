const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Collection
const resultsCollection = db.collection("results");

// -----------------------------------------------------
// CREATE RESULT
// -----------------------------------------------------
exports.createResult = onRequest(async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      score,
      status,
      publishedAt,
      createdBy,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const data = {
      title,
      description,
      category: category || "",
      score: score || null,
      status: status || "published", // published | draft
      publishedAt: publishedAt
        ? Timestamp.fromDate(new Date(publishedAt))
        : Timestamp.now(),
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await resultsCollection.add(data);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE RESULT
// -----------------------------------------------------
exports.updateResult = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Result ID required" });
    }

    if (updates.publishedAt) {
      updates.publishedAt = Timestamp.fromDate(new Date(updates.publishedAt));
    }

    updates.updatedAt = Timestamp.now();
    await resultsCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE RESULT
// -----------------------------------------------------
exports.deleteResult = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Result ID required" });
    }

    await resultsCollection.doc(id).delete();
    res.json({ success: true, message: "Result deleted" });
  } catch (err) {
    console.error("Error deleting result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET RESULTS LIST
// -----------------------------------------------------
exports.getResults = onRequest(async (req, res) => {
  try {
    const { category, status, limit = 50 } = req.body || {};

    let query = resultsCollection.orderBy("publishedAt", "desc");

    if (category) query = query.where("category", "==", category);
    if (status) query = query.where("status", "==", status);

    const snap = await query.limit(limit).get();
    const results = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, results });
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET SINGLE RESULT
// -----------------------------------------------------
exports.getResultDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Result ID required" });
    }

    const doc = await resultsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Result not found" });
    }

    res.json({
      success: true,
      result: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching result detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
