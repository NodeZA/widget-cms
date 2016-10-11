"use strict";

const csrf = require('lusca').csrf();


module.exports.csrf = function(opts) {
  return function(req, res, next) {
    if (opts.whitelist.indexOf(req.path) > -1) {
      return next();
    }

    csrf(req, res, next);
  };
};
