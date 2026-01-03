const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Firestore collection
const transportCollection = db.collection("transport");

// -----------------------------------------------------
// CREATE TRANSPORT
// -----------------------------------------------------
exports.createTransport = onRequest(async (req, res) => {
  try {
    const { name, type, route, contactNumber, description, createdBy } =
      req.body;

    if (!name) {
      return res.status(400).json({ error: "Transport name is required" });
    }

    if (!type) {
      return res.status(400).json({ error: "Transport type is required" });
    }

    const transportData = {
      name,
      type, // bus | auto | taxi | train
      route: route || "",
      contactNumber: contactNumber || "",
      description: description || "",
      status: "active",
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await transportCollection.add(transportData);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating transport:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// UPDATE TRANSPORT
// -----------------------------------------------------
exports.updateTransport = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Transport ID required" });
    }

    updates.updatedAt = Timestamp.now();
    await transportCollection.doc(id).update(updates);

    return res.json({ success: true, message: "Transport updated" });
  } catch (err) {
    console.error("Error updating transport:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// DELETE TRANSPORT
// -----------------------------------------------------
exports.deleteTransport = onRequest(async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Transport ID required" });
    }

    await transportCollection.doc(id).delete();
    return res.json({ success: true, message: "Transport deleted" });
  } catch (err) {
    console.error("Error deleting transport:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// GET TRANSPORT LIST
// -----------------------------------------------------
exports.getTransports = onRequest(async (req, res) => {
  try {
    const { type, limit = 100 } = req.body || {};

    let query = transportCollection.orderBy("createdAt", "desc");
    if (type) query = query.where("type", "==", type);

    const snap = await query.limit(limit).get();
    const transports = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return res.json({ success: true, transports });
  } catch (err) {
    console.error("Error fetching transports:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// GET SINGLE TRANSPORT
// -----------------------------------------------------
exports.getTransportDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Transport ID required" });
    }

    const doc = await transportCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Transport not found" });
    }

    return res.json({
      success: true,
      transport: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching transport detail:", err);
    return res.status(500).json({ error: err.message });
  }
});
