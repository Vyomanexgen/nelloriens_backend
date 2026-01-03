const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");

const { getFirestore, FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();
const foodsCollection = db.collection("famous_foods");

// -----------------------------------------------------
// CREATE FOOD ITEM
// -----------------------------------------------------
exports.createFamousFood = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        name,
        category,
        priceRange,
        location,
        rating,
        description,
        tags,
        imageUrl,
        mustTry,
        createdBy,
      } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: "Food name is required" });
      }

      const data = {
        name,
        category: category || "",
        priceRange: priceRange || "",
        location: location || "",
        rating: rating || 0,
        description: description || "",
        tags: Array.isArray(tags) ? tags : [],
        imageUrl: imageUrl || "",
        mustTry: !!mustTry,
        createdBy: createdBy || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const ref = await foodsCollection.add(data);
      res.json({ success: true, id: ref.id });
    } catch (err) {
      console.error("❌ Error creating food:", err);
      res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }
  });
});

// -----------------------------------------------------
// UPDATE FOOD ITEM
// -----------------------------------------------------
exports.updateFamousFood = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id, ...updates } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Food ID required" });
      }

      updates.updatedAt = FieldValue.serverTimestamp();
      await foodsCollection.doc(id).update(updates);

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error updating food:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// DELETE FOOD ITEM
// -----------------------------------------------------
exports.deleteFamousFood = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: "Food ID required" });
      }

      await foodsCollection.doc(id).delete();
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error deleting food:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// GET FOODS LIST
// -----------------------------------------------------
exports.getFamousFoods = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { category, tag, limit = 100 } = req.body || {};

      let query = foodsCollection.orderBy("createdAt", "desc");
      if (category) query = query.where("category", "==", category);
      if (tag) query = query.where("tags", "array-contains", tag);

      const snap = await query.limit(limit).get();
      const foods = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ success: true, foods });
    } catch (err) {
      console.error("❌ Error fetching foods:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// -----------------------------------------------------
// GET FOOD DETAIL
// -----------------------------------------------------
exports.getFamousFoodDetail = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Food ID required" });
      }

      const doc = await foodsCollection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Food not found" });
      }

      res.json({
        success: true,
        food: { id: doc.id, ...doc.data() },
      });
    } catch (err) {
      console.error("❌ Error fetching food detail:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
