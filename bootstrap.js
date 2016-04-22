"use strict";

const path = require('path');
const fs = require('fs');
const widgetLoader = require('widget-loader');
let Bootstrap = {};


Bootstrap.initBookshelf = function (config) {
  console.log("✔ Initializing bookshelf...");

  return require('./core/bookshelf')(config);
};


Bootstrap.initServer = function (App) {
    console.log("✔ Initializing server...");

    return require('./server')(App);
};


Bootstrap.initWidgets = function (App) {
    let widgetsDir = App._config.widgetsDir || path.join(App._config.rootDir, 'widgets');

    if (!(fs.existsSync(widgetsDir) && fs.readdirSync(widgetsDir).length)) {
      return null;
    }

    console.log("✔ Initializing widgets...");

    return widgetLoader(App, {
      widgetDirectory: widgetsDir
    });
};


Bootstrap.loadModels = function (config) {
  console.log("✔ Loading widgets...");

  let modelsDir = config.modelsDir || path.join(config.rootDir, 'models');

  fs.existsSync(modelsDir) && fs.readdirSync(modelsDir).forEach( (m) => {
    require(`${modelsDir}/${m}`);
  });
};


Bootstrap.loadCollections = function (config) {
  console.log("✔ Loading collections...");
  let collectionsDir = config.collectionsDir || path.join(config.rootDir, 'collections');

  fs.existsSync(collectionsDir) && fs.readdirSync(collectionsDir).forEach( (m) => {
    require(`${collectionsDir}/${m}`);
  });
};


Bootstrap.loadControllers = function (config) {
  console.log("✔ Loading controllers...");
  let controllersDir = path.join(config.rootDir, 'controllers');

  fs.existsSync(controllersDir) && fs.readdirSync(controllersDir).forEach( (m) => {
    require(`${controllersDir}/${m}`);
  });
};


Bootstrap.loadPlugins = function (config) {
  console.log("✔ Loading plugins...");

  let pluginsDir = config.pluginsDir || path.join(config.rootDir, 'plugins');
  let plugins = {};

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

  fs.existsSync(routesDir) && fs.readdirSync(routesDir).forEach( (m) => {
    require(`${routesDir}/${m}`);
  });
};


module.exports = Bootstrap;
