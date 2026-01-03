const { adaptModule } = require("./adapter");

/**
 * Auto-registers routes for a module
 *
 * Example:
 * registerModule(app, "jobs", require("./jobs"))
 */
function registerModule(app, basePath, moduleExports) {
  const adapted = adaptModule(moduleExports);

  for (const fnName in adapted) {
    const routePath = `/${basePath}/${fnName}`;
    app.all(routePath, adapted[fnName]);

    console.log(`✔ Route registered: ${routePath}`);
  }
}

module.exports = { registerModule };
