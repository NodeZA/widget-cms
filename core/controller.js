"use strict";


const _ = require('lodash');
const utils = require('../lib/utils');
let controllerInstance = null;


module.exports = function (app) {

  if (controllerInstance) {
    return controllerInstance;
  }

  function Controller() {
    this.initialize.apply(this, _.toArray(arguments));
  };

  _.extend(Controller.prototype, {
    initialize: function () {}
  });

  Controller.extend = utils.extend;

  controllerInstance = Controller;

  return Controller
};
