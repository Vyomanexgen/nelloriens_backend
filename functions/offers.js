const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");

const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();
const offersCollection = db.collection("offers");

// -----------------------------------------------------
// CREATE OFFER
// -----------------------------------------------------
exports.createOffer = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const data = req.body || {};

      if (!data.title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const offer = {
        title: data.title,
        status: data.status || "draft",
        category: data.category || "",
        discountType: data.discountType || "",
        discountValue: data.discountValue || "",
        shortDescription: data.shortDescription || "",
        couponCode: data.couponCode || "",
        minCart: data.minCart || "",
        location: data.location || "",
        bookingUrl: data.bookingUrl || "",
        expiry: data.expiry ? Timestamp.fromDate(new Date(data.expiry)) : null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        mediaUrl: data.mediaUrl || "",
        createdBy: data.createdBy || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await offersCollection.add(offer);
      res.json({ success: true, id: ref.id });
    } catch (err) {
      console.error("Error creating offer:", err);
      res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  });
});

// -----------------------------------------------------
// UPDATE OFFER
// -----------------------------------------------------
exports.updateOffer = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id, ...updates } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Offer ID required" });
      }

      if (updates.expiry) {
        updates.expiry = Timestamp.fromDate(new Date(updates.expiry));
      }

      updates.updatedAt = FieldValue.serverTimestamp();
      await offersCollection.doc(id).update(updates);

      res.json({ success: true });
    } catch (err) {
      console.error("Error updating offer:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// DELETE OFFER
// -----------------------------------------------------
exports.deleteOffer = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Offer ID required" });
      }

      await offersCollection.doc(id).delete();
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting offer:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// GET ALL OFFERS
// -----------------------------------------------------
exports.getOffers = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snap = await offersCollection.orderBy("createdAt", "desc").get();

      const offers = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ success: true, offers });
    } catch (err) {
      console.error("Error fetching offers:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// GET OFFER DETAIL
// -----------------------------------------------------
exports.getOfferDetail = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Offer ID required" });
      }

      const doc = await offersCollection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Offer not found" });
      }

      res.json({
        success: true,
        offer: { id: doc.id, ...doc.data() },
      });
    } catch (err) {
      console.error("Error fetching offer detail:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
