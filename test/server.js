"use strict";

let appInstance = null;


module.exports = function () {
  if (appInstance) {
    return appInstance;
  }
  let App = require('../');
  App.config({
    port: 3000, // default 3000
    secret: 'my_ninja_cat',
    db: {
      client: 'sqlite3', // pg
      connection: {
        filename: ":memory:"
      },
      useNullAsDefault: true
    },
    rootDir: process.cwd(),
    cache: false,
    log: false,
    middleware: {
      enableForms: true,
      enableCSRF: false,
      inputValidation: true,
      enableSessions: true
    }
  });

  appInstance = App.start();

  return appInstance;
};
