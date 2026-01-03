const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { registerModule } = require("./registerRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------------- MODULES -------------------
registerModule(app, "jobs", require("./jobs"));
registerModule(app, "movies", require("./Movies"));
registerModule(app, "transport", require("./Transport"));
registerModule(app, "news", require("./news"));
registerModule(app, "offers", require("./offers"));
registerModule(app, "media", require("./media"));
registerModule(app, "notifications", require("./notifications"));
registerModule(app, "updates", require("./updates"));
registerModule(app, "results", require("./results"));
registerModule(app, "sports", require("./sports"));
registerModule(app, "famousFoods", require("./famousFoods"));
registerModule(app, "famousStay", require("./famousStay"));
registerModule(app, "history", require("./history"));
registerModule(app, "commonAds", require("./commonAds"));

// ------------------- HEALTH CHECK -------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "Nelloriens API running 🚀" });
});

// ------------------- SERVER -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
