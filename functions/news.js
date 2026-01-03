const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Collections
const newsCollection = db.collection("news");
const newsLinesCollection = db.collection("newsLines");

// -----------------------------------------------------
// CREATE NEWS ARTICLE
// -----------------------------------------------------
exports.createNews = onRequest(async (req, res) => {
  try {
    const {
      title,
      category,
      status,
      pinned,
      featured,
      author,
      publishDate,
      visibility,
      coverImageUrl,
      summary,
      body,
      tags,
      sourceUrl,
      seoTitle,
      seoDescription,
      showRightRailAd,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newsData = {
      title,
      category: category || "",
      status: status || "draft",
      pinned: !!pinned,
      featured: !!featured,
      author: author || "",
      publishDate: publishDate
        ? Timestamp.fromDate(new Date(publishDate))
        : null,
      visibility: visibility || "site-wide",
      coverImageUrl: coverImageUrl || null,
      summary: summary || "",
      body: body || "",
      tags: Array.isArray(tags) ? tags : [],
      sourceUrl: sourceUrl || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      showRightRailAd: !!showRightRailAd,
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await newsCollection.add(newsData);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating news:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE NEWS ARTICLE
// -----------------------------------------------------
exports.updateNews = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "News ID required" });
    }

    if (updates.publishDate) {
      updates.publishDate = Timestamp.fromDate(new Date(updates.publishDate));
    }

    updates.updatedAt = Timestamp.now();
    await newsCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE NEWS ARTICLE
// -----------------------------------------------------
exports.deleteNews = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "News ID required" });
    }

    await newsCollection.doc(id).delete();
    res.json({ success: true, message: "News deleted" });
  } catch (err) {
    console.error("Error deleting news:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET NEWS LIST
// -----------------------------------------------------
exports.getNews = onRequest(async (req, res) => {
  try {
    const { category, status, limit = 50 } = req.body || {};
    let query = newsCollection.orderBy("publishDate", "desc");

    if (category) query = query.where("category", "==", category);
    if (status) query = query.where("status", "==", status);

    const snap = await query.limit(limit).get();
    const news = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, news });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET SINGLE NEWS DETAIL
// -----------------------------------------------------
exports.getNewsDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "News ID required" });
    }

    const doc = await newsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({
      success: true,
      news: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching news detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// NEWS LINE MODULE
// -----------------------------------------------------

exports.createNewsLine = onRequest(async (req, res) => {
  try {
    const {
      name,
      visibility,
      pinned,
      autoRefreshSeconds,
      includeJobs,
      includeResults,
      includeNotifications,
      filters,
      order,
      createdBy,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "News line name is required" });
    }

    const lineData = {
      name,
      visibility: visibility || "public",
      pinned: !!pinned,
      autoRefreshSeconds: autoRefreshSeconds || 60,
      includeJobs: !!includeJobs,
      includeResults: !!includeResults,
      includeNotifications: !!includeNotifications,
      filters: filters || {
        categories: [],
        region: null,
        priority: null,
        topics: [],
      },
      order: Array.isArray(order) ? order : [],
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await newsLinesCollection.add(lineData);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating news line:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.updateNewsLine = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "News line ID required" });
    }

    updates.updatedAt = Timestamp.now();
    await newsLinesCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating news line:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.deleteNewsLine = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "News line ID required" });
    }

    await newsLinesCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting news line:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.getNewsLines = onRequest(async (req, res) => {
  try {
    const snap = await newsLinesCollection.orderBy("createdAt", "desc").get();

    const lines = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, lines });
  } catch (err) {
    console.error("Error fetching news lines:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
