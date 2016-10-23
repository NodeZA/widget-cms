"use strict";

const config = require('./config.json');

module.exports.config = config;

module.exports.exec = function (App) {
  return Promise.resolve(null);
};
