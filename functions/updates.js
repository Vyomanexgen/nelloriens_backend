const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Collection
const updatesCollection = db.collection("updates");

// -----------------------------------------------------
// CREATE UPDATE
// -----------------------------------------------------
exports.createUpdate = onRequest(async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      visibility,
      relatedUrl,
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
      type: type || "general", // general | system | event
      priority: priority || "normal", // low | normal | high
      visibility: visibility || "public", // public | users | admins
      relatedUrl: relatedUrl || null,
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await updatesCollection.add(data);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE UPDATE
// -----------------------------------------------------
exports.updateUpdate = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Update ID required" });
    }

    updates.updatedAt = Timestamp.now();
    await updatesCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE UPDATE
// -----------------------------------------------------
exports.deleteUpdate = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Update ID required" });
    }

    await updatesCollection.doc(id).delete();
    res.json({ success: true, message: "Update deleted" });
  } catch (err) {
    console.error("Error deleting update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET UPDATES LIST
// -----------------------------------------------------
exports.getUpdates = onRequest(async (req, res) => {
  try {
    const { type, priority, visibility, limit = 50 } = req.body || {};

    let query = updatesCollection.orderBy("createdAt", "desc");

    if (type) query = query.where("type", "==", type);
    if (priority) query = query.where("priority", "==", priority);
    if (visibility) query = query.where("visibility", "==", visibility);

    const snap = await query.limit(limit).get();
    const updates = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, updates });
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET SINGLE UPDATE
// -----------------------------------------------------
exports.getUpdateDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Update ID required" });
    }

    const doc = await updatesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Update not found" });
    }

    res.json({
      success: true,
      update: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching update detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
