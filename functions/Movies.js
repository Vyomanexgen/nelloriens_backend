const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Firestore collection
const moviesCollection = db.collection("movies");

// -----------------------------------------------------
// CREATE MOVIE
// -----------------------------------------------------
exports.createMovie = onRequest(async (req, res) => {
  try {
    const {
      title,
      language,
      genre,
      duration,
      rating,
      releaseDate,
      description,
      posterUrl,
      trailerUrl,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Movie title is required" });
    }

    const movieData = {
      title,
      language: language || "",
      genre: Array.isArray(genre) ? genre : [],
      duration: duration || "",
      rating: rating || "",
      releaseDate: releaseDate || "",
      description: description || "",
      posterUrl: posterUrl || "",
      trailerUrl: trailerUrl || "",
      status: "active",
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await moviesCollection.add(movieData);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating movie:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// UPDATE MOVIE
// -----------------------------------------------------
exports.updateMovie = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Movie ID required" });
    }

    updates.updatedAt = Timestamp.now();
    await moviesCollection.doc(id).update(updates);

    return res.json({ success: true, message: "Movie updated" });
  } catch (err) {
    console.error("Error updating movie:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// DELETE MOVIE
// -----------------------------------------------------
exports.deleteMovie = onRequest(async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Movie ID required" });
    }

    await moviesCollection.doc(id).delete();
    return res.json({ success: true, message: "Movie deleted" });
  } catch (err) {
    console.error("Error deleting movie:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// GET MOVIES LIST
// -----------------------------------------------------
exports.getMovies = onRequest(async (req, res) => {
  try {
    const { language, status = "active", limit = 100 } = req.body || {};

    let query = moviesCollection
      .where("status", "==", status)
      .orderBy("createdAt", "desc");

    if (language) {
      query = query.where("language", "==", language);
    }

    const snap = await query.limit(limit).get();
    const movies = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return res.json({ success: true, movies });
  } catch (err) {
    console.error("Error fetching movies:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// GET SINGLE MOVIE
// -----------------------------------------------------
exports.getMovieDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Movie ID required" });
    }

    const doc = await moviesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Movie not found" });
    }

    return res.json({
      success: true,
      movie: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching movie detail:", err);
    return res.status(500).json({ error: err.message });
  }
});
