const { onRequest } = require("firebase-functions/v2/https");
const { admin } = require("./db");
const { v4: uuidv4 } = require("uuid");

const bucket = admin.storage().bucket();

exports.uploadMedia = onRequest(async (req, res) => {
  try {
    const { fileName, base64File, folder } = req.body;

    if (!base64File) {
      return res.status(400).json({ error: "base64File is required" });
    }

    const uploadFolder = folder || "uploads";
    const uniqueId = uuidv4();
    const finalFileName = fileName
      ? `${uploadFolder}/${uniqueId}-${fileName}`
      : `${uploadFolder}/${uniqueId}.jpg`;

    const buffer = Buffer.from(base64File, "base64");

    const file = bucket.file(finalFileName);
    await file.save(buffer, {
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uniqueId,
        },
      },
    });

    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(finalFileName)}?alt=media&token=${uniqueId}`;

    res.json({ success: true, url: downloadURL, fileName: finalFileName });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

exports.deleteMedia = onRequest(async (req, res) => {
  const { fileName } = req.body;
  await bucket.file(fileName).delete();
  res.json({ success: true });
});

exports.getMediaUrl = onRequest(async (req, res) => {
  const { fileName, token } = req.query;
  const url = `https://firebasestorage.googleapis.com/v0/b/${
    bucket.name
  }/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;
  res.json({ success: true, url });
});
