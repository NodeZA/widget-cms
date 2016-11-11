"use strict";

const path = require('path');
const fs = require('fs');
const Bootstrap = {};


Bootstrap.initBookshelf = function (config) {
  console.log("✔ Initializing bookshelf...");

  return require('./core/bookshelf')(config);
};


Bootstrap.initServer = function (App) {
    console.log("✔ Initializing server...");

    return require('./server')(App);
};


Bootstrap.loadModels = function (config) {
  console.log("✔ Loading models...");

  let modelsDir = config.modelsDir || path.join(config.rootDir, 'models');

  if (!(fs.existsSync(modelsDir) && fs.readdirSync(modelsDir).length)) {
    return null;
  }

  fs.existsSync(modelsDir) && fs.readdirSync(modelsDir).forEach( (m) => {
    require(`${modelsDir}/${m}`);
  });
};


Bootstrap.loadCollections = function (config) {
  console.log("✔ Loading collections...");

  let collectionsDir = config.collectionsDir || path.join(config.rootDir, 'collections');

  if (!(fs.existsSync(collectionsDir) && fs.readdirSync(collectionsDir).length)) {
    return null;
  }

  fs.existsSync(collectionsDir) && fs.readdirSync(collectionsDir).forEach( (m) => {
    require(`${collectionsDir}/${m}`);
  });
};


Bootstrap.loadControllers = function (config) {
  console.log("✔ Loading controllers...");

  let controllersDir = path.join(config.rootDir, 'controllers');

  if (!(fs.existsSync(controllersDir) && fs.readdirSync(controllersDir).length)) {
    return null;
  }

  fs.existsSync(controllersDir) && fs.readdirSync(controllersDir).forEach( (m) => {
    require(`${controllersDir}/${m}`);
  });
};


Bootstrap.loadPlugins = function (config) {
  console.log("✔ Loading plugins...");

  let pluginsDir = config.pluginsDir || path.join(config.rootDir, 'plugins');
  let plugins = {};

  if (!(fs.existsSync(pluginsDir) && fs.readdirSync(pluginsDir).length)) {
    return null;
  }

  fs.existsSync(pluginsDir) && fs.readdirSync(pluginsDir).forEach( (m) => {
    let plugin = require(`${pluginsDir}/${m}`)(config);

    if (plugins.hasOwnProperty(plugin.name)) {
      return new Error('Plugin property name already defined.');
    }

    plugins[plugin.name] = plugin;
  });

  return plugins;
};


Bootstrap.loadRoutes = function (config) {
  console.log("✔ Loading routes...");

  let routesDir = config.routesDir || path.join(config.rootDir, 'routes');

  if (!(fs.existsSync(routesDir) && fs.readdirSync(routesDir).length)) {
    return null;
  }

  fs.existsSync(routesDir) && fs.readdirSync(routesDir).forEach( (m) => {
    require(`${routesDir}/${m}`);
  });
};


module.exports = Bootstrap;
