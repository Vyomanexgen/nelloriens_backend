const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");

const { getFirestore, FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();
const commonAdsCollection = db.collection("commonAds");

// -------------------------------
// Create Common Ad
// -------------------------------
exports.createCommonAd = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        title,
        imageUrl,
        ctaText,
        destinationUrl,
        placement,
        status = "active",
      } = req.body || {};

      if (!title || !imageUrl || !destinationUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newAd = {
        title,
        imageUrl,
        ctaText: ctaText || "",
        destinationUrl,
        placement: placement || "site-wide",
        status,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await commonAdsCollection.add(newAd);

      res.json({
        success: true,
        id: docRef.id,
      });
    } catch (err) {
      console.error("❌ Error creating common ad:", err);
      res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  });
});

// -------------------------------
// Get All Common Ads
// -------------------------------
exports.getCommonAds = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { placement, status } = req.query;

      let query = commonAdsCollection.orderBy("createdAt", "desc");
      if (placement) query = query.where("placement", "==", placement);
      if (status) query = query.where("status", "==", status);

      const snapshot = await query.get();
      const ads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ success: true, ads });
    } catch (err) {
      console.error("❌ Error fetching common ads:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -------------------------------
// Get Single Common Ad
// -------------------------------
exports.getCommonAdDetail = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Missing ad id" });
      }

      const doc = await commonAdsCollection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Common Ad not found" });
      }

      res.json({
        success: true,
        ad: { id: doc.id, ...doc.data() },
      });
    } catch (err) {
      console.error("❌ Error fetching common ad detail:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -------------------------------
// Update Common Ad
// -------------------------------
exports.updateCommonAd = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id, ...updates } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Missing ad id" });
      }

      updates.updatedAt = FieldValue.serverTimestamp();
      await commonAdsCollection.doc(id).update(updates);

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error updating common ad:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -------------------------------
// Delete Common Ad
// -------------------------------
exports.deleteCommonAd = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Missing ad id" });
      }

      await commonAdsCollection.doc(id).delete();
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error deleting common ad:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -------------------------------
// Toggle Ad Status
// -------------------------------
exports.toggleCommonAdStatus = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id, status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ error: "Missing fields" });
      }

      await commonAdsCollection.doc(id).update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error toggling status:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
