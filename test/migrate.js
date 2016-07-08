"use strict";

const _ = require('lodash');
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
      filename: './test.sqlite'
  },
  useNullAsDefault: true
});
const schema = require('./schema');
const schemaTables = _.keys(schema);

function createTable(table) {
  console.log(' > Creating ' + table + ' table....');

  return knex.schema.createTable(table, function (t) {
    let columnKeys = _.keys(schema[table]);

    _.each(columnKeys, function (column) {
      return addTableColumn(table, t, column);
    });
  });
}


function addTableColumn(tablename, table, columnname) {
    let column;
    let columnSpec = schema[tablename][columnname];

    // creation distinguishes between text with fieldtype, string with maxlength and all others
    if (columnSpec.type === 'text' && columnSpec.hasOwnProperty('fieldtype')) {
      column = table[columnSpec.type](columnname, columnSpec.fieldtype);
    }
    else if (columnSpec.type === 'string' && columnSpec.hasOwnProperty('maxlength')) {
      column = table[columnSpec.type](columnname, columnSpec.maxlength);
    }
    else {
      column = table[columnSpec.type](columnname);
    }

    if (columnSpec.hasOwnProperty('nullable') && columnSpec.nullable === true) {
      column.nullable();
    }
    else {
      column.notNullable();
    }

    if (columnSpec.hasOwnProperty('primary') && columnSpec.primary === true) {
      column.primary();
    }

    if (columnSpec.hasOwnProperty('unique') && columnSpec.unique) {
      column.unique();
    }

    if (columnSpec.hasOwnProperty('unsigned') && columnSpec.unsigned) {
      column.unsigned();
    }

    if (columnSpec.hasOwnProperty('references')) {
      //check if table exists?
      column.references(columnSpec.references);
    }

    if (columnSpec.hasOwnProperty('defaultTo')) {
      column.defaultTo(columnSpec.defaultTo);
    }
}


function deleteTable(table) {
  return knex.schema.dropTableIfExists(table);
}


module.exports.start = function () {
  let tables = [];

  console.log('Creating database tables.......');

  tables = _.map(schemaTables, function (table) {
    return createTable(table);
  });

  return Promise.all(tables);
};


module.exports.reset = function () {
  let tables = [];

  tables = _.map(schemaTables, function (table) {
    deleteTable(table);
  }).reverse();

  return Promise.all(tables);
};
