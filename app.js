"use strict";

/*
   Notes:
   Set user model from the onset
*/

const _ = require('lodash');
const bootstrap = require('./bootstrap');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

function App() {
  EventEmitter.call(this);
}

util.inherits(App, EventEmitter);

_.assign(App.prototype, {

  config: function (config) {
    // store configuration
    this._config = config;
    this._middleware = null;
  },


  registerMiddleware: function (middleware) {
    this._middleware = this._middleware || [];

    this._middleware.push(middleware);
  },


  start: function () {
    if (!this._config) {
      throw new Error('Application configuration not set.');
    }

    // initialize Bookshelf
    let Bookshelf = bootstrap.initBookshelf(this._config.db);

    if (this._config.cache) {
      this.cache = require('express-redis-cache')(this._config.redis);
    }

    // initialize base model
    Bookshelf = require('./core/model')(Bookshelf);

    // initialize base collection
    Bookshelf = require('./core/collection')(Bookshelf);

    this.Bookshelf = Bookshelf;
    this.Model = Bookshelf.Model;
    this.Collection = Bookshelf.Collection;

    this.server = bootstrap.initServer(this._config, this._middleware);

    bootstrap.loadModels(this._config);
    bootstrap.loadCollections(this._config);

    this.Controller = require('./core/controller')(this);

    this.Plugins = bootstrap.loadPlugins(this._config);
    bootstrap.loadControllers(this._config);

    let widgetMiddleware = bootstrap.initWidgets(this);

    // add widget middleware
    this.server.use(widgetMiddleware);



    bootstrap.loadRoutes(this._config);

    // start server
    this.server.listen(this.server.get('port'), this.server.get('ipAddress'), () => {
      console.info("✔ Express server listening on port %d in %s mode", this.server.get('port'), this.server.get('env'));
    });
  },


  addCollection: function () {
    let args = Array.prototype.slice.call(arguments);
    return this.Bookshelf.collection.apply(this.Bookshelf, args);
  },


  addModel: function () {
    let args = Array.prototype.slice.call(arguments);
    return this.Bookshelf.model.apply(this.Bookshelf, args);
  },


  getPlugin: function (name) {
    if (this._plugins[name]) {
      let plugin = this._plugins[name];

      return plugin;
    }
    else {
      return null;
    }
  },


  controller: function (name, val) {
    this._controllers = this._controllers || Object.create(null);

    if (this._controllers[name]) throw new Error(name + ' is already defined in the registry');

    this._controllers[name] = val;

    return val;
  },


  getController: function (name) {
    this._controllers = this._controllers || Object.create(null);

    if (this._controllers[name]) {
      return new this._controllers[name]();
    }
    else {
      return null;
    }
  },


  getControllers: function () {
    return _.keys(this._controllers).map((val) => {
      return {
        name: val,
        methods: _.keys(this._controllers[val])
      };
    });
  },


  getModel: function (name, options) {
    if (!this.Bookshelf._models[name]) {
      throw new Error(`Collection<${name}> not found`);
    }

    return new (this.Bookshelf._models[name])(options);
  },


  getCollection: function (name, options) {
    if (!this.Bookshelf._collections[name]) {
      throw new Error(`Collection<${name}> not found`);
    }

    return new (this.Bookshelf._collections[name])(options);
  },


  getCache: function (name) {
    this._cache = this._cache || {};
    return this._cache[name];
  },


  setCache: function (name, val) {
    this._cache = this._cache || {};

    this._cache[name] = val;
  },


  cacheExists: function (name) {
    this._cache = this._cache || {};
    return !!this._cache[name];
  },


  get: function () {
    let args = _.toArray(arguments);

    if (this._config.cache) {
      if (args.length === 2) {
        args.splice(1, 0, this.cache.route());
      }

      if (args.length === 3) {
        let secondArg = [];

        if (_.isFunction(args[1])) {
          secondArg.push(args[1]);
          secondArg.push(this.cache.route());
        }
        else if (_.isArray(args[1])) {
          secondArg = args[1];
          secondArg.push(this.cache.route());
        }

        args.splice(1, 1, secondArg);
      }
    }

    this.server.get.apply(this.server, args);
  },


  post: function () {
    let args = _.toArray(arguments);
    this.server.post.apply(this.server, args);
  },


  getConfig: function (name) {
    var blacklist = ['mongodb','mysql','mailgun','github','twitter','google'];
    var safeToSee = _.omit(this._config, blacklist);

    return safeToSee[name];
  },


  updateConfig: function (name, val) {
    if (config[name]) {
      config[name] = val;
    }
  }
});


module.exports = new App;
