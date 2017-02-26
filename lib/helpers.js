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


  hbs.registerHelper('list', function(items, pageOrAuthor, options) {

    let templates ='';
    let template = '';
    let i;
    let collection;
    let model;
    let context = {};

    context.user = options.data.user;
    context._csrf = options.data._csrf;

    if (_.isObject(pageOrAuthor)) {
      context.author = pageOrAuthor;
    }
    else {
      context.page = pageOrAuthor;
    }

    for (i=0; i<items.length; i++) {
        template = hbs.compile(items[i].template);

        context.config = items[i].config;
        collection = items[i].collection;
        model = items[i].model;

        if (collection) {
          context.collection = collection.toJSON();
        }

        else if (model) {
          context.tags = model.related('tags').toJSON();
          context.author = model.related('created_by').toJSON();

          context.post = model.toJSON();
        }

        templates += template(context);
    }

    return templates;
  });
};
