"use strict";


module.exports.setup = function (hbs) {

  let blocks = {};
  let partials = hbs.handlebars.partials;

  hbs.registerHelper('extend', function(name, context) {
    let block = blocks[name];

    if (!block) {
      block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
  });


  hbs.registerHelper('block', function(name) {
    let val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];

    return val;
  });



  hbs.registerHelper('include', function(name, context) {
    let template = partials[name];

    if (!template) {
      return console.error("Partial not loaded");
    }

    template = hbs.compile(template);

    return template(context);
  });

};
