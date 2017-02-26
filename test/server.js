"use strict";

let appInstance = null;
const path = require('path');

module.exports = function () {
  if (appInstance) {
    return appInstance;
  }

  let App = require('../');

  App.config({
    port: 3007, // default 3000
    secret: 'my_ninja_cat',
    db: {
      client: 'sqlite3',
      connection: {
          filename: './test.sqlite'
      },
      useNullAsDefault: true
    },
    rootDir: process.cwd(),
    modelsDir: path.join(__dirname, 'models'),
    cache: false,
    saveLogs: false,
    middleware: {
      enableForms: true,
      enableCSRF: false,
      inputValidation: false,
      enableSessions: false
    }
  });

  appInstance = App.start();

  return appInstance;
};
