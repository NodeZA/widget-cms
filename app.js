"use strict";

/*
   Notes:
   Set user model from the onset
*/

const _ = require('lodash');
const path = require('path');
const typeIs = require('type-is');
const mimetypes = require('mime-types');
const bootstrap = require('./bootstrap');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const multer  = require('multer');


function App() {
  EventEmitter.call(this);
}

util.inherits(App, EventEmitter);

_.assign(App.prototype, {

  config: function (config) {
    // store configuration
    if (this._config) {
      throw new Error('Application configuration already set');
    }

    this._config = config;
    this._middleware = [];

    return this;
  },


  registerMiddleware: function (middleware) {
    this._middleware.push(middleware);
  },


  start: function (done) {
    if (!this._config) {
      throw new Error('Application configuration not set');
    }

    // initialize Bookshelf
    let Bookshelf = bootstrap.initBookshelf(this._config.db);

    // initialize base model
    Bookshelf = require('./core/model')(Bookshelf);

    // initialize base collection
    Bookshelf = require('./core/collection')(Bookshelf);

    this.Bookshelf = Bookshelf;
    this.Model = Bookshelf.Model;
    this.Collection = Bookshelf.Collection;


    bootstrap.loadModels(this._config);
    bootstrap.loadCollections(this._config);

    this.Controller = require('./core/controller')(this);

    this.server = bootstrap.initServer(this);

    this._plugins = bootstrap.loadPlugins(this._config);
    bootstrap.loadControllers(this._config);

    let widgetMiddleware = bootstrap.initWidgets(this);

    // add widget middleware
    if (widgetMiddleware) {
      this.server.use(widgetMiddleware);
    }

    bootstrap.loadRoutes(this._config);

    // file uploads
    let storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this._config.uploadsDir || path.join(this._config.rootDir, 'public', 'img'));
      },
      filename: function (req, file, cb) {
        let filename = `image_${Date.now()}.${mimetypes.extension(file.mimetype)}`;
        cb(null, filename );
      }
    });

    this.uploader = multer({storage: storage}).any();

    // start server
    this.server.listen(this.server.get('port'), this.server.get('ipAddress'), () => {
      console.info("✔ Express server listening on port %d in %s mode", this.server.get('port'), this.server.get('env'));

      if(done) {
        done();
      }
    });

    return this;
  },


  addCollection: function () {
    return this.Bookshelf.collection.apply(this.Bookshelf, _.toArray(arguments));
  },


  passport: function () {
    return this.server.get('passport');
  },


  addModel: function () {
    return this.Bookshelf.model.apply(this.Bookshelf, _.toArray(arguments));
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


  addController: function (name, val) {
    this._controllers = this._controllers || Object.create(null);

    if (this._controllers[name]) {
      throw new Error(name + ' is already defined in the registry');
    }

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


  hasController: function (name, method) {
    return !!this._controllers[name] && _.isFunction(this._controllers[name].prototype[method]);
  },


  getControllers: function () {
    return _.keys(this._controllers).map((val) => {
      return {
        name: val,
        methods: _.keys(this._controllers[val].prototype)
      };
    });
  },


  clearCache: function (name, callback) {
    let cache = this.server.get('cache');

    cache.del(name || '*', callback || function(){});
  },


  getModel: function (name, options) {
    if (!this.Bookshelf._models[name]) {
      throw new Error(`Model<${name}> not found`);
    }

    return this.Bookshelf._models[name];
  },


  getCollection: function (name, options) {
    if (!this.Bookshelf._collections[name]) {
      throw new Error(`Collection<${name}> not found`);
    }

    return this.Bookshelf._collections[name];
  },


  get: function () {
    let args = _.toArray(arguments);

    if (this._config.cache) {

      let cache = this.server.get('cache');

      if (args.length === 2) {
        args.splice(1, 0, cache.route());
      }

      if (args.length === 3) {
        let secondArg = [];

        if (_.isFunction(args[1])) {
          secondArg.push(args[1]);
          secondArg.push(cache.route());
        }
        else if (_.isArray(args[1])) {
          secondArg = args[1];
          secondArg.push(cache.route());
        }

        args.splice(1, 1, secondArg);
      }
    }

    this.server.get.apply(this.server, args);
  },


  post: function () {
    let args = _.toArray(arguments);

    // this middleware ensures that forms with
    // enctype multipart are handled correctly
    let middleware = (req, res, next) => {
      if (typeIs(req, ['multipart'])) {
        this.uploader(req, req, function (err) {
          if (err) {
            return next(err);
          }
          next();
        });
      }
      else {
        next();
      }
    };

    if (args.length === 2) {
      args.splice(1, 0, middleware);
    }

    if (args.length === 3) {
      let secondArg = [];

      if (_.isFunction(args[1])) {
        secondArg.push(args[1]);
        secondArg.push(middleware);
      }
      else if (_.isArray(args[1])) {
        secondArg = args[1];
        secondArg.push(middleware);
      }

      args.splice(1, 1, secondArg);
    }

    this.server.post.apply(this.server, args);
  },


  getConfig: function (name) {
    return this._config[name];
  },


  updateConfig: function (name, val) {
    if (this._config[name]) {
      this._config[name] = val;
    }
  }
});


module.exports = new App;
