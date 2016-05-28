"use strict";


let Bookshelf = null;

module.exports = function (config) {

  if (Bookshelf) {
  	return Bookshelf;
  }

  let knex = require('knex')(config);

  Bookshelf = require('bookshelf')(knex);

  /*
   * This solves the circular module dependency problem created by Bookshelf models
   * in a previous commit #38d98bb4c33e91b636a3538bd546ebe7f5077328
  **/
  Bookshelf.plugin('registry');
  Bookshelf.plugin('pagination');

  console.info("✔ Bookshelf initialized.");

  return Bookshelf;
};
