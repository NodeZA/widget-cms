
"use strict";

/*
 *  Application point of entry
**/
let appInstance = null;

module.exports = (function () {
  if (!appInstance) {
    appInstance = require('./app');
  }

  return appInstance;
})();
