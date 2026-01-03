function adaptFirebaseHandler(fn) {
  return (req, res) => {
    try {
      return fn(req, res);
    } catch (err) {
      console.error("Adapter error:", err);
      res.status(500).json({ error: err.message });
    }
  };
}

function adaptModule(moduleExports) {
  const adapted = {};

  for (const key in moduleExports) {
    if (typeof moduleExports[key] === "function") {
      adapted[key] = adaptFirebaseHandler(moduleExports[key]);
    }
  }

  return adapted;
}

module.exports = { adaptModule };
